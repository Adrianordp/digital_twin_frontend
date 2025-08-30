import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DigitalTwinApiClient } from '../src/services/api';

describe('DigitalTwinApiClient', () => {
    const client = new DigitalTwinApiClient('http://test-api');

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- initSimulation ---
    it('initSimulation returns session_id on success', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ session_id: 'abc-123' })
            } as unknown as Response)
        ));
        const result = await client.initSimulation('water_tank');
        expect(result).toEqual({ session_id: 'abc-123' });
        expect(fetch).toHaveBeenCalledWith(
            'http://test-api/simulate/init',
            expect.objectContaining({ method: 'POST' })
        );
    });
    it('initSimulation throws on HTTP error', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                text: () => Promise.resolve('Invalid model'),
            } as unknown as Response)
        ));
        await expect(client.initSimulation('invalid_model')).rejects.toThrow(
            /Failed to initialize simulation: 400 Bad Request - Invalid model/
        );
    });

    // --- stepSimulation ---
    it('stepSimulation returns state on success', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ state: { value: 99 } })
            } as unknown as Response)
        ));
        const result = await client.stepSimulation('session-abc', 1.23, 0.5);
        expect(result).toEqual({ state: { value: 99 } });
        expect(fetch).toHaveBeenCalledWith(
            'http://test-api/simulate/step',
            expect.objectContaining({ method: 'POST' })
        );
    });
    it('stepSimulation throws on HTTP error', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: () => Promise.resolve('Step failed'),
            } as unknown as Response)
        ));
        await expect(
            client.stepSimulation('session-abc', 1.23, 0.5)
        ).rejects.toThrow(/Failed to step simulation: 500 Internal Server Error - Step failed/);
    });

    // --- getState ---
    it('getState returns state on success', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ state: { value: 42 } })
            } as unknown as Response)
        ));
        const result = await client.getState('session-xyz');
        expect(result).toEqual({ state: { value: 42 } });
        expect(fetch).toHaveBeenCalledWith('http://test-api/simulate/state/session-xyz');
    });

    // --- getHistory ---
    it('getHistory returns history on success', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ history: [{ t: 0, v: 1 }, { t: 1, v: 2 }] })
            } as unknown as Response)
        ));
        const result = await client.getHistory('session-hist');
        expect(result).toEqual({ history: [{ t: 0, v: 1 }, { t: 1, v: 2 }] });
        expect(fetch).toHaveBeenCalledWith('http://test-api/simulate/history/session-hist');
    });

    // --- getLogs ---
    it('getLogs returns logs on success', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ logs: ['log1', 'log2'] })
            } as unknown as Response)
        ));
        const result = await client.getLogs('session-logs');
        expect(result).toEqual({ logs: ['log1', 'log2'] });
        expect(fetch).toHaveBeenCalledWith('http://test-api/simulate/logs/session-logs');
    });
    it('getLogs throws on HTTP error', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: () => Promise.resolve('Logs not found'),
            } as unknown as Response)
        ));
        await expect(client.getLogs('session-logs')).rejects.toThrow(
            /Failed to get logs: 404 Not Found - Logs not found/
        );
    });

    // --- resetSimulation ---
    it('resetSimulation returns state on success', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ state: { reset: true } })
            } as unknown as Response)
        ));
        const result = await client.resetSimulation('session-reset', { foo: 'bar' });
        expect(result).toEqual({ state: { reset: true } });
        expect(fetch).toHaveBeenCalledWith(
            'http://test-api/simulate/reset',
            expect.objectContaining({ method: 'POST' })
        );
    });
    it('resetSimulation throws on HTTP error', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                text: () => Promise.resolve('Reset failed'),
            } as unknown as Response)
        ));
        await expect(
            client.resetSimulation('session-reset', { foo: 'bar' })
        ).rejects.toThrow(/Failed to reset simulation: 400 Bad Request - Reset failed/);
    });

    // --- updateParams ---
    it('updateParams returns state on success', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ state: { updated: true } })
            } as unknown as Response)
        ));
        const result = await client.updateParams('session-update', { param: 123 });
        expect(result).toEqual({ state: { updated: true } });
        expect(fetch).toHaveBeenCalledWith(
            'http://test-api/simulate/params',
            expect.objectContaining({ method: 'PATCH' })
        );
    });
    it('updateParams throws on HTTP error', async () => {
        vi.stubGlobal('fetch', vi.fn((): Promise<Response> =>
            Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: () => Promise.resolve('Update failed'),
            } as unknown as Response)
        ));
        await expect(
            client.updateParams('session-update', { param: 123 })
        ).rejects.toThrow(/Failed to update params: 500 Internal Server Error - Update failed/);
    });
});
