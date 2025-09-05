import { useState } from 'react';
import { apiClient } from '../services/api-client';

type Props = {
    sessionId: string;
    onRefresh?: () => void;
};

export default function SimulationControls({ sessionId, onRefresh }: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [stepCount, setStepCount] = useState<number | null>(null);
    const [simTime, setSimTime] = useState<number | null>(null);

    function extractStepAndTime(state: Record<string, unknown> | null) {
        if (!state) return { step: null as number | null, time: null as number | null };
        const maybeKeys = ['step', 'step_count', 'time', 't', 'simulation_time'];
        let step: number | null = null;
        let time: number | null = null;
        for (const k of maybeKeys) {
            const v = state[k];
            if (v === undefined) continue;
            if (['step', 'step_count'].includes(k) && typeof v === 'number') step = v;
            if (['time', 't', 'simulation_time'].includes(k) && typeof v === 'number') time = v;
        }
        return { step, time };
    }

    const step = async () => {
        setLoading(true);
        setError(null);
        const maxRetries = 3;
        let attempt = 0;
        let lastError: unknown = null;
        while (attempt < maxRetries) {
            try {
                await apiClient.stepSimulation(sessionId, 0);
                try {
                    const sres = await apiClient.getState(sessionId);
                    const { step, time } = extractStepAndTime(sres.state ?? null);
                    setStepCount(step);
                    setSimTime(time);
                } catch (e) {
                    void e;
                }
                onRefresh?.();
                lastError = null;
                break;
            } catch (err: unknown) {
                lastError = err;
                attempt += 1;
                const wait = 200 * Math.pow(2, attempt - 1);
                await new Promise((r) => setTimeout(r, wait));
            }
        }

        if (lastError) {
            const msg = lastError instanceof Error ? lastError.message : String(lastError);
            setError(msg);
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
                <button
                    className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
                    onClick={step}
                    disabled={loading}
                >
                    {loading ? 'Stepping...' : 'Step Forward'}
                </button>
                <div className="text-sm text-gray-700">
                    {stepCount !== null && <span className="mr-3">Step: {stepCount}</span>}
                    {simTime !== null && <span>Time: {simTime}</span>}
                </div>
            </div>
            {error && (
                <div className="text-sm text-red-600">
                    {error}
                    <button
                        className="ml-3 text-xs text-blue-600 underline"
                        onClick={() => {
                            void step();
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
