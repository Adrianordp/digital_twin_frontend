import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationControls from '../src/components/SimulationControls';
import { apiClient } from '../src/services/api-client';

// Mock the API client
vi.mock('../src/services/api-client', () => ({
    apiClient: {
        stepSimulation: vi.fn(),
        getState: vi.fn(),
    },
}));

const mockApiClient = vi.mocked(apiClient);

describe('SimulationControls', () => {
    const defaultProps = {
        sessionId: 'test-session-123',
        selectedModel: 'water_tank' as const,
        onRefresh: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Default successful responses
        mockApiClient.stepSimulation.mockResolvedValue({ state: {} });
        mockApiClient.getState.mockResolvedValue({
            state: { step: 5, time: 10.5 }
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders step forward button and control inputs', () => {
        render(<SimulationControls {...defaultProps} />);

        expect(screen.getByRole('button', { name: /step forward/i })).toBeInTheDocument();
        expect(screen.getByText('Control:')).toBeInTheDocument();
        expect(screen.getByTestId('control-slider')).toBeInTheDocument();
        expect(screen.getByTestId('control-input')).toBeInTheDocument();
    });

    it('displays model-specific configuration for water_tank', () => {
        render(<SimulationControls {...defaultProps} selectedModel="water_tank" />);

        const slider = screen.getByTestId('control-slider') as HTMLInputElement;
        const numberInput = screen.getByTestId('control-input') as HTMLInputElement;

        expect(slider.min).toBe('0');
        expect(slider.max).toBe('100');
        expect(slider.step).toBe('1');
        expect(numberInput.min).toBe('0');
        expect(numberInput.max).toBe('100');
        expect(screen.getByText('L/s')).toBeInTheDocument();
    });

    it('displays model-specific configuration for room_temperature', () => {
        render(<SimulationControls {...defaultProps} selectedModel="room_temperature" />);

        const slider = screen.getByTestId('control-slider') as HTMLInputElement;
        const numberInput = screen.getByTestId('control-input') as HTMLInputElement;

        expect(slider.min).toBe('-10');
        expect(slider.max).toBe('40');
        expect(slider.step).toBe('0.1');
        expect(numberInput.min).toBe('-10');
        expect(numberInput.max).toBe('40');
        expect(screen.getByText('°C')).toBeInTheDocument();
    });

    it('uses default configuration for unknown model', () => {
        render(<SimulationControls {...defaultProps} selectedModel="unknown_model" />);

        const slider = screen.getByTestId('control-slider') as HTMLInputElement;
        const numberInput = screen.getByTestId('control-input') as HTMLInputElement;

        expect(slider.min).toBe('-100');
        expect(slider.max).toBe('100');
        expect(slider.step).toBe('1');
        expect(numberInput.min).toBe('-100');
        expect(numberInput.max).toBe('100');
        expect(screen.queryByText(/L\/s|°C/)).not.toBeInTheDocument();
    });

    it('syncs slider and number input values', async () => {
        render(<SimulationControls {...defaultProps} selectedModel="water_tank" />);

        const slider = screen.getByTestId('control-slider') as HTMLInputElement;
        const numberInput = screen.getByTestId('control-input') as HTMLInputElement;

        // Change slider value
        fireEvent.change(slider, { target: { value: '50' } });
        expect(numberInput.value).toBe('50');

        // Change number input value
        fireEvent.change(numberInput, { target: { value: '75' } });
        expect(slider.value).toBe('75');
    });

    it('calls stepSimulation with correct control value when step button is clicked', async () => {
        render(<SimulationControls {...defaultProps} />);

        const slider = screen.getByTestId('control-slider');
        const stepButton = screen.getByRole('button', { name: /step forward/i });

        // Set control value
        fireEvent.change(slider, { target: { value: '25' } });

        // Click step button
        fireEvent.click(stepButton);

        await waitFor(() => {
            expect(mockApiClient.stepSimulation).toHaveBeenCalledWith('test-session-123', 25);
        });
    });

    it('calls onRefresh after successful step', async () => {
        const onRefresh = vi.fn();
        render(<SimulationControls {...defaultProps} onRefresh={onRefresh} />);

        const stepButton = screen.getByRole('button', { name: /step forward/i });
        fireEvent.click(stepButton);

        await waitFor(() => {
            expect(onRefresh).toHaveBeenCalledTimes(1);
        });
    });

    it('displays step count and simulation time after successful step', async () => {
        mockApiClient.getState.mockResolvedValue({
            state: { step_count: 10, simulation_time: 25.7 }
        });

        render(<SimulationControls {...defaultProps} />);

        const stepButton = screen.getByRole('button', { name: /step forward/i });
        fireEvent.click(stepButton);

        await waitFor(() => {
            expect(screen.getByText('Step: 10')).toBeInTheDocument();
            expect(screen.getByText('Time: 25.7')).toBeInTheDocument();
        });
    });

    it('shows loading state during step operation', async () => {
        let resolveStep: (value: { state: Record<string, unknown> }) => void;
        const stepPromise = new Promise<{ state: Record<string, unknown> }>(resolve => {
            resolveStep = resolve;
        });
        mockApiClient.stepSimulation.mockReturnValue(stepPromise);

        render(<SimulationControls {...defaultProps} />);

        const stepButton = screen.getByRole('button', { name: /step forward/i });
        fireEvent.click(stepButton);

        // Button should show loading state
        expect(screen.getByText('Stepping...')).toBeInTheDocument();
        expect(stepButton).toBeDisabled();

        // Resolve the promise
        resolveStep!({ state: {} });
        await waitFor(() => {
            expect(screen.getByText('Step Forward')).toBeInTheDocument();
            expect(stepButton).not.toBeDisabled();
        });
    });

    it('displays error message when step fails', async () => {
        mockApiClient.stepSimulation.mockRejectedValue(new Error('Network error'));

        render(<SimulationControls {...defaultProps} />);

        const stepButton = screen.getByRole('button', { name: /step forward/i });
        fireEvent.click(stepButton);

        // Wait for the error to appear after all retries
        await waitFor(() => {
            expect(screen.getByText(/Network error/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        }, { timeout: 15000 });
    });

    it('retries on failure with exponential backoff', async () => {
        // Mock first two calls to fail, third to succeed
        mockApiClient.stepSimulation
            .mockRejectedValueOnce(new Error('First failure'))
            .mockRejectedValueOnce(new Error('Second failure'))
            .mockResolvedValueOnce({ state: {} });

        render(<SimulationControls {...defaultProps} />);

        const stepButton = screen.getByRole('button', { name: /step forward/i });
        fireEvent.click(stepButton);

        // Wait for all retries to complete
        await waitFor(() => {
            expect(mockApiClient.stepSimulation).toHaveBeenCalledTimes(3);
        }, { timeout: 10000 });

        // Should not show error since last retry succeeded
        await waitFor(() => {
            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });
    });

    it('shows final error after max retries exceeded', async () => {
        mockApiClient.stepSimulation.mockRejectedValue(new Error('Persistent error'));

        render(<SimulationControls {...defaultProps} />);

        const stepButton = screen.getByRole('button', { name: /step forward/i });
        fireEvent.click(stepButton);

        // Wait for all retries to complete and error to be shown
        await waitFor(() => {
            expect(mockApiClient.stepSimulation).toHaveBeenCalledTimes(3);
            expect(screen.getByText(/Persistent error/i)).toBeInTheDocument();
        }, { timeout: 15000 });
    }); it('allows manual retry via retry button', async () => {
        // Mock to fail for all automatic retries (3 times), then succeed on manual retry
        mockApiClient.stepSimulation.mockRejectedValue(new Error('First error'))
            .mockRejectedValueOnce(new Error('First error'))
            .mockRejectedValueOnce(new Error('First error'))
            .mockRejectedValueOnce(new Error('First error'))
            .mockResolvedValueOnce({ state: {} });

        render(<SimulationControls {...defaultProps} />);

        const stepButton = screen.getByRole('button', { name: /step forward/i });
        fireEvent.click(stepButton);

        // Wait for the error to appear after retries fail
        await waitFor(() => {
            expect(screen.getByText(/First error/i)).toBeInTheDocument();
        }, { timeout: 15000 });

        // Clear the mock and set it up for success on retry
        mockApiClient.stepSimulation.mockClear();
        mockApiClient.stepSimulation.mockResolvedValueOnce({ state: {} });

        const retryButton = screen.getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);

        await waitFor(() => {
            expect(screen.queryByText(/First error/i)).not.toBeInTheDocument();
        });
    });

    it('clamps control value when model changes', async () => {
        const { rerender } = render(
            <SimulationControls {...defaultProps} selectedModel="water_tank" />
        );

        const numberInput = screen.getByTestId('control-input') as HTMLInputElement;

        // Set value to 150 (outside water_tank range)
        fireEvent.change(numberInput, { target: { value: '150' } });

        // Change to room_temperature model (range: -10 to 40)
        rerender(
            <SimulationControls {...defaultProps} selectedModel="room_temperature" />
        );

        await waitFor(() => {
            // Value should be clamped to room_temperature max (40)
            expect(numberInput.value).toBe('40');
        });
    });

    it('handles missing state data gracefully', async () => {
        mockApiClient.getState.mockResolvedValue({ state: {} });

        render(<SimulationControls {...defaultProps} />);

        const stepButton = screen.getByRole('button', { name: /step forward/i });
        fireEvent.click(stepButton);

        await waitFor(() => {
            expect(screen.queryByText(/step:/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/time:/i)).not.toBeInTheDocument();
        });
    });

    it('continues with step operation even if getState fails', async () => {
        const onRefresh = vi.fn();
        mockApiClient.stepSimulation.mockResolvedValue({ state: {} });
        mockApiClient.getState.mockRejectedValue(new Error('State fetch error'));

        render(<SimulationControls {...defaultProps} onRefresh={onRefresh} />);

        const stepButton = screen.getByRole('button', { name: /step forward/i });
        fireEvent.click(stepButton);

        await waitFor(() => {
            expect(onRefresh).toHaveBeenCalledTimes(1);
            expect(screen.queryByText(/state fetch error/i)).not.toBeInTheDocument();
        });
    });
});
