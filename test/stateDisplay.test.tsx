import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StateDisplay from '../src/components/StateDisplay';
import { apiClient } from '../src/services/api-client';

vi.mock('../src/services/api-client', () => ({
    apiClient: {
        getState: vi.fn(),
    },
}));

describe('StateDisplay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows message when no session', () => {
        render(<StateDisplay sessionId={null} />);
        expect(screen.getByText(/No active simulation session/)).toBeInTheDocument();
    });

    it('fetches and displays state when session present', async () => {
        const mocked = vi.mocked(apiClient.getState as any);
        mocked.mockResolvedValue({ state: { value: 5, name: 'test' } });

        render(<StateDisplay sessionId={'session-1'} />);

        expect(await screen.findByText('value')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('name')).toBeInTheDocument();
        expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('refresh button triggers fetch', async () => {
        const mocked = vi.mocked(apiClient.getState as any);
        mocked.mockResolvedValue({ state: { a: 1 } });

        render(<StateDisplay sessionId={'session-2'} />);

        const btn = await screen.findByTestId('refresh-button');
        expect(btn).toBeInTheDocument();

        mocked.mockResolvedValue({ state: { a: 2 } });
        fireEvent.click(btn);

        expect(mocked).toHaveBeenCalled();
    });
});
