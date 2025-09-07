import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationChartContainer from '../src/components/SimulationChartContainer';
import SessionContext from '../src/context/SessionContext';

vi.mock('../src/services/api-client', () => ({
    apiClient: {
        getHistory: vi.fn(),
    },
}));

// Mock SimulationChart to validate props without rendering Recharts
vi.mock('../src/components/SimulationChart', () => ({
    __esModule: true,
    default: ({ data }: { data: Array<Record<string, number | string>> }) => (
        <div data-testid="simulation-chart" data-data-length={data.length} />
    ),
}));

const { apiClient } = await import('../src/services/api-client');

function renderWithSession(sessionId: string | null) {
    return render(
        <SessionContext.Provider value={{
            selectedModel: 'water_tank',
            setSelectedModel: () => { },
            sessionId,
            setSessionId: () => { },
        }}>
            <SimulationChartContainer />
        </SessionContext.Provider>
    );
}

describe('SimulationChartContainer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows message when no session is selected', () => {
        renderWithSession(null);
        expect(screen.getByText(/no session selected/i)).toBeInTheDocument();
    });

    it('shows loading then renders chart with data on success', async () => {
        vi.mocked(apiClient.getHistory).mockResolvedValue({
            history: [
                { time: 0, value: 1 },
                { time: 1, value: 2 },
            ]
        });

        renderWithSession('session-1');

        // loading state
        expect(screen.getByText(/loading chart/i)).toBeInTheDocument();

        // chart rendered with data
        await waitFor(() => {
            expect(screen.getByTestId('simulation-chart')).toBeInTheDocument();
            expect(screen.getByTestId('simulation-chart')).toHaveAttribute('data-data-length', '2');
        });
    });

    it('shows error on API failure', async () => {
        vi.mocked(apiClient.getHistory).mockRejectedValue(new Error('boom'));

        renderWithSession('session-2');

        await waitFor(() => {
            expect(screen.getByText(/error: boom/i)).toBeInTheDocument();
        });
    });

    it('shows no data message when history is empty', async () => {
        vi.mocked(apiClient.getHistory).mockResolvedValue({ history: [] });

        renderWithSession('session-3');

        await waitFor(() => {
            expect(screen.getByText(/no history data available/i)).toBeInTheDocument();
        });
    });
});
