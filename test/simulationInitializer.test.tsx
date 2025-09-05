import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationInitializer from '../src/components/SimulationInitializer';
import { apiClient } from '../src/services/api';

vi.mock('../src/services/api', () => ({
    apiClient: {
        initSimulation: vi.fn(),
    },
}));

describe('SimulationInitializer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form and initializes session on submit', async () => {
        const mocked = vi.mocked(apiClient.initSimulation);
        mocked.mockResolvedValue({ session_id: 'session-123' });

        const onInit = vi.fn();
        render(<SimulationInitializer modelName="water_tank" onInit={onInit} />);

        // Use structured initial value input
        const input = screen.getByPlaceholderText('Leave empty to use advanced JSON');
        fireEvent.change(input, { target: { value: '10' } });

        const button = screen.getByRole('button', { name: /Initialize Simulation/i });
        fireEvent.click(button);

        await waitFor(() => expect(mocked).toHaveBeenCalledWith('water_tank', { initial: 10 }));
        await waitFor(() => expect(onInit).toHaveBeenCalledWith('session-123'));

        expect(screen.getByText(/Session: session-123/)).toBeInTheDocument();
    });

    it('shows error for invalid JSON', async () => {
        render(<SimulationInitializer modelName="water_tank" />);
        const input = screen.getByPlaceholderText('Leave empty to use advanced JSON');
        // Toggle advanced to reveal textarea and enter invalid JSON
        const toggle = screen.getByText('Show advanced JSON');
        fireEvent.click(toggle);
        const textarea = screen.getByPlaceholderText('{ "initial": 0 }');
        fireEvent.change(textarea, { target: { value: '{invalid' } });

        const button = screen.getByRole('button', { name: /Initialize Simulation/i });
        fireEvent.click(button);

        expect(await screen.findByText('Invalid JSON in parameters')).toBeInTheDocument();
    });

    it('shows error message when API fails', async () => {
        const mocked = vi.mocked(apiClient.initSimulation);
        mocked.mockRejectedValue(new Error('Server error'));

        render(<SimulationInitializer modelName="room_temperature" />);

        const button = screen.getByRole('button', { name: /Initialize Simulation/i });
        fireEvent.click(button);

        expect(await screen.findByText(/Server error/)).toBeInTheDocument();
    });

    it('accepts advanced JSON object and sends parsed params', async () => {
        const mocked = vi.mocked(apiClient.initSimulation);
        mocked.mockResolvedValue({ session_id: 'session-json-1' });

        render(<SimulationInitializer modelName="room_temperature" />);

        // Reveal advanced textarea
        const toggle = screen.getByText('Show advanced JSON');
        fireEvent.click(toggle);
        const textarea = screen.getByTestId('params-textarea');
        fireEvent.change(textarea, { target: { value: '{ "initial": 42, "name": "test" }' } });

        const button = screen.getByTestId('init-button');
        fireEvent.click(button);

        await waitFor(() => expect(mocked).toHaveBeenCalledWith('room_temperature', { initial: 42, name: 'test' }));
        expect(await screen.findByText(/Session: session-json-1/)).toBeInTheDocument();
    });
});
