import { useEffect, useState } from 'react';
import { apiClient } from '../services/api-client';

type Props = {
    sessionId: string;
    selectedModel?: string | null;
    onRefresh?: () => void;
};

const MODEL_CONFIGS: Record<string, { min: number; max: number; step: number; default: number; unit?: string }> = {
    water_tank: { min: 0, max: 100, step: 1, default: 0, unit: 'L/s' },
    room_temperature: { min: -10, max: 40, step: 0.1, default: 0, unit: '°C' },
};

export default function SimulationControls({ sessionId, selectedModel = null, onRefresh }: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [stepCount, setStepCount] = useState<number | null>(null);
    const [simTime, setSimTime] = useState<number | null>(null);
    const [showResetDialog, setShowResetDialog] = useState<boolean>(false);

    const config = selectedModel && MODEL_CONFIGS[selectedModel] ? MODEL_CONFIGS[selectedModel] : { min: -100, max: 100, step: 1, default: 0 };
    const [controlValue, setControlValue] = useState<number>(config.default);

    useEffect(() => {
        setControlValue((v) => Math.min(config.max, Math.max(config.min, v)));
    }, [selectedModel, config.max, config.min]);

    function extractStepAndTime(state: Record<string, unknown> | null) {
        if (!state) return { step: null as number | null, time: null as number | null };
        const maybeKeys = ['step', 'step_count', 'time', 't', 'simulation_time'];
        let step: number | null = null;
        let time: number | null = null;
        for (const k of maybeKeys) {
            const v = state[k];
            if (v === undefined) continue;
            if ((k === 'step' || k === 'step_count') && typeof v === 'number') step = v;
            if ((k === 'time' || k === 't' || k === 'simulation_time') && typeof v === 'number') time = v;
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
                await apiClient.stepSimulation(sessionId, controlValue);
                try {
                    const sres = await apiClient.getState(sessionId);
                    const { step: sc, time } = extractStepAndTime(sres.state ?? null);
                    setStepCount(sc);
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
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <button
                    className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
                    onClick={step}
                    disabled={loading}
                >
                    {loading ? 'Stepping...' : 'Step Forward'}
                </button>

                <button
                    className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-60 hover:bg-red-700"
                    onClick={() => setShowResetDialog(true)}
                    disabled={loading}
                >
                    Reset Simulation
                </button>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                    {stepCount !== null && <span className="mr-2">Step: {stepCount}</span>}
                    {simTime !== null && <span className="mr-2">Time: {simTime}</span>}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <label htmlFor="control-slider" className="text-sm text-gray-700 font-medium">Control:</label>
                <input
                    id="control-slider"
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={controlValue}
                    onChange={(e) => setControlValue(Number(e.target.value))}
                    className="flex-1"
                    data-testid="control-slider"
                />
                <input
                    id="control-input"
                    type="number"
                    value={controlValue}
                    step={config.step}
                    min={config.min}
                    max={config.max}
                    onChange={(e) => setControlValue(Number(e.target.value))}
                    className="w-20 border rounded px-2 py-1 text-sm"
                    data-testid="control-input"
                    aria-labelledby="control-slider"
                />
                {config.unit && <span className="text-sm text-gray-600">{config.unit}</span>}
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

            {/* Reset Confirmation Dialog */}
            {showResetDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Reset Simulation</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to reset the simulation? This will clear all current progress and return to the initial state.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                onClick={() => setShowResetDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={() => {
                                    // TODO: Implement reset functionality
                                    setShowResetDialog(false);
                                }}
                            >
                                Confirm Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
