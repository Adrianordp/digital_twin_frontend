import { useState } from 'react';
import { apiClient } from '../services/api-client';
import { useSession } from '../context/useSession';

export interface SimulationInitializerProps {
    modelName: string;
    onInit?: (sessionId: string) => void;
}

export default function SimulationInitializer({ modelName, onInit }: SimulationInitializerProps) {
    const [paramsText, setParamsText] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { sessionId: ctxSessionId, setSessionId } = useSession();
    const [localSessionId, setLocalSessionId] = useState<string | null>(null);
    const [initialValue, setInitialValue] = useState<number | ''>('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    async function handleInit(e?: React.FormEvent) {
        e?.preventDefault();
        setError(null);

        let params: Record<string, unknown> | null = null;
        // Structured input wins over raw JSON if provided
        if (initialValue !== '') {
            params = { initial: initialValue };
        } else if (paramsText.trim() !== '') {
            try {
                // Allow users to enter JSON object
                const parsed = JSON.parse(paramsText);
                if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    setError('Parameters must be a JSON object');
                    return;
                }
                params = parsed as Record<string, unknown>;
            } catch {
                setError('Invalid JSON in parameters');
                return;
            }
        }

        setLoading(true);
        try {
            const res = await apiClient.initSimulation(modelName, params);
            // Update both local display state and shared context
            setLocalSessionId(res.sessionId);
            setSessionId(res.sessionId);
            if (onInit) onInit(res.sessionId);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleInit} className="space-y-4">
            <h3 className="text-md font-medium text-gray-800">Initialize Simulation</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <div className="mt-1 text-sm text-gray-600">{modelName}</div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="initial" className="block text-sm font-medium text-gray-700">Initial value</label>
                    <button type="button" className="text-xs text-blue-600" onClick={() => setInitialValue(10)}>Preset: 10</button>
                </div>
                <input
                    id="initial"
                    type="number"
                    value={initialValue}
                    onChange={(e) => setInitialValue(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Leave empty to use advanced JSON"
                    data-testid="initial-input"
                    className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm"
                />
                <div className="mt-2">
                    <button type="button" className="text-sm text-gray-600" onClick={() => setShowAdvanced(s => !s)}>
                        {showAdvanced ? 'Hide advanced JSON' : 'Show advanced JSON'}
                    </button>
                </div>
                {showAdvanced && (
                    <textarea
                        id="params"
                        value={paramsText}
                        onChange={(e) => setParamsText(e.target.value)}
                        placeholder='{ "initial": 0 }'
                        data-testid="params-textarea"
                        className="mt-2 block w-full min-h-[6rem] rounded-md border border-gray-200 shadow-sm"
                    />
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    data-testid="init-button"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
                >
                    {loading ? 'Initializing...' : 'Initialize Simulation'}
                </button>
                {(localSessionId || ctxSessionId) && (
                    <div className="text-sm text-green-600">Session: {localSessionId ?? ctxSessionId}</div>
                )}
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
        </form>
    );
}
