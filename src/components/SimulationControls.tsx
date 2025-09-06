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
    const [resetLoading, setResetLoading] = useState<boolean>(false);
    const [resetError, setResetError] = useState<string | null>(null);
    const [resetParams, setResetParams] = useState<string>('{}');

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

    const resetSimulation = async () => {
        setResetLoading(true);
        setResetError(null);
        // Clear visible simulation state immediately to reflect reset in UI
        setStepCount(null);
        setSimTime(null);
        // Reset control value to model default immediately
        setControlValue(config.default);

        try {
            // Parse the parameters from the input
            let parsedParams: Record<string, unknown> | null = null;
            if (resetParams.trim() !== '{}' && resetParams.trim() !== '') {
                try {
                    parsedParams = JSON.parse(resetParams);
                } catch {
                    throw new Error('Invalid JSON parameters. Please check the format.');
                }
            }

            // Call the API to reset the simulation with parameters
            const result = await apiClient.resetSimulation(sessionId, parsedParams);

            // Extract step and time from the reset state
            const { step: sc, time } = extractStepAndTime(result.state ?? null);
            setStepCount(sc);
            setSimTime(time);

            // Reset control value to default for the current model
            setControlValue(config.default);

            // Clear any previous errors
            setError(null);

            // Refresh parent components
            onRefresh?.();

            // Close the dialog
            setShowResetDialog(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setResetError(msg);
        }

        setResetLoading(false);
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
                    onClick={() => {
                        setResetParams('{}');
                        setResetError(null);
                        setShowResetDialog(true);
                    }}
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
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to reset the simulation? This will clear all current progress and return to the initial state.
                        </p>

                        <div className="mb-4">
                            <label htmlFor="reset-params" className="block text-sm font-medium text-gray-700 mb-2">
                                Reset Parameters (optional JSON):
                            </label>
                            <textarea
                                id="reset-params"
                                className="w-full border border-gray-300 rounded p-2 text-sm font-mono h-20 resize-none"
                                placeholder='{"param1": "value1", "param2": "value2"}'
                                value={resetParams}
                                onChange={(e) => setResetParams(e.target.value)}
                                disabled={resetLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty or use {"{}"} for default parameters
                            </p>
                        </div>

                        {resetError && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                                Failed to reset simulation: {resetError}
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-60"
                                onClick={() => {
                                    setShowResetDialog(false);
                                    setResetError(null);
                                    setResetParams('{}');
                                }}
                                disabled={resetLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                                onClick={resetSimulation}
                                disabled={resetLoading}
                            >
                                {resetLoading ? 'Resetting...' : 'Confirm Reset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
