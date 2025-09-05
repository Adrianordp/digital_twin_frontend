import { useEffect, useState } from 'react';
import { apiClient } from '../services/api-client';

export interface StateDisplayProps {
    sessionId: string | null;
}

export default function StateDisplay({ sessionId }: StateDisplayProps) {
    const [state, setState] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchState() {
        if (!sessionId) return;
        setError(null);
        setLoading(true);
        try {
            const res = await apiClient.getState(sessionId);
            setState(res.state ?? null);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
            setState(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (sessionId) fetchState();
        else {
            setState(null);
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    if (!sessionId) {
        return <div className="text-sm text-gray-600">No active simulation session.</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-gray-800">Current State</h3>
                <div className="flex items-center gap-2">
                    <button
                        className="text-sm text-gray-700 hover:text-blue-600"
                        onClick={fetchState}
                        disabled={loading}
                        data-testid="refresh-button"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            {!error && state && (
                <div className="mt-2 bg-gray-50 rounded-md p-3 border border-gray-100">
                    {/* Try to render a simple table for flat objects */}
                    {isFlatObject(state) ? (
                        <table className="w-full text-sm">
                            <tbody>
                                {Object.entries(state).map(([k, v]) => (
                                    <tr key={k} className="border-b last:border-b-0">
                                        <td className="py-2 text-gray-700 font-medium w-1/3">{k}</td>
                                        <td className="py-2 text-gray-700">{String(v)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <pre className="whitespace-pre-wrap text-xs text-gray-700">{JSON.stringify(state, null, 2)}</pre>
                    )}
                </div>
            )}

            {!error && !state && !loading && (
                <div className="text-sm text-gray-600">State is empty or unavailable.</div>
            )}
        </div>
    );
}

function isFlatObject(obj: Record<string, unknown>): boolean {
    const keys = Object.keys(obj);
    if (keys.length === 0) return false;
    return keys.every((k) => {
        const v = obj[k];
        return v === null || ['string', 'number', 'boolean'].includes(typeof v);
    });
}
