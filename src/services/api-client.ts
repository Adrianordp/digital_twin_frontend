// API client wrapper for Dual-System Digital Twin backend
// This wraps the generated client to provide a cleaner interface

import {
    SimulationApi,
    Configuration
} from './generated-client';
import type {
    SessionInitRequest,
    SessionInitResponse,
    StateResponse,
    HistoryResponse,
    LogsResponse,
    StepRequest,
    ResetRequest,
    UpdateParamsRequest
} from './generated-client';

const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export class DigitalTwinApiClient {
    private api: SimulationApi;

    constructor(baseUrl: string = DEFAULT_API_BASE_URL) {
        const config = new Configuration({
            basePath: baseUrl,
        });
        this.api = new SimulationApi(config);
    }

    setBaseUrl(url: string) {
        const config = new Configuration({
            basePath: url,
        });
        this.api = new SimulationApi(config);
    }

    /**
     * Initialize a new simulation session.
     * @param model_name The model to simulate (e.g., 'water_tank', 'room_temperature')
     * @param params Optional model-specific parameters
     * @returns Promise resolving to SessionInitResponse
     */
    async initSimulation(
        model_name: string,
        params?: Record<string, unknown> | null
    ): Promise<SessionInitResponse> {
        try {
            const request: SessionInitRequest = {
                modelName: model_name,
                params: params
            };

            return await this.api.initSimulationSimulateInitPost({
                sessionInitRequest: request
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize simulation: ${message}`);
        }
    }

    /**
     * Advance the simulation by one step.
     */
    async stepSimulation(
        session_id: string,
        control_input: number,
        delta_time?: number
    ): Promise<StateResponse> {
        try {
            const request: StepRequest = {
                sessionId: session_id,
                controlInput: control_input,
                deltaTime: delta_time
            };

            return await this.api.stepSimulationSimulateStepPost({
                stepRequest: request
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to step simulation: ${message}`);
        }
    }

    /**
     * Get the current state of a simulation session.
     */
    async getState(session_id: string): Promise<StateResponse> {
        try {
            return await this.api.getStateSimulateStateSessionIdGet({
                sessionId: session_id
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get state: ${message}`);
        }
    }

    /**
     * Get the history of a simulation session.
     */
    async getHistory(session_id: string): Promise<HistoryResponse> {
        try {
            return await this.api.getHistorySimulateHistorySessionIdGet({
                sessionId: session_id
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get history: ${message}`);
        }
    }

    /**
     * Get the logs of a simulation session.
     */
    async getLogs(session_id: string): Promise<LogsResponse> {
        try {
            return await this.api.getLogsSimulateLogsSessionIdGet({
                sessionId: session_id
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get logs: ${message}`);
        }
    }

    /**
     * Reset a simulation session, optionally with new parameters.
     */
    async resetSimulation(
        session_id: string,
        params?: Record<string, unknown> | null
    ): Promise<StateResponse> {
        try {
            const request: ResetRequest = {
                sessionId: session_id,
                params: params
            };

            return await this.api.resetSimulationSimulateResetPost({
                resetRequest: request
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to reset simulation: ${message}`);
        }
    }

    /**
     * Update model parameters for a simulation session.
     */
    async updateParams(
        session_id: string,
        params: Record<string, unknown>
    ): Promise<StateResponse> {
        try {
            const request: UpdateParamsRequest = {
                sessionId: session_id,
                params: params
            };

            return await this.api.updateParamsSimulateParamsPatch({
                updateParamsRequest: request
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to update params: ${message}`);
        }
    }
}

export const apiClient = new DigitalTwinApiClient();

// Export types from generated client for use in components
export type {
    SessionInitRequest,
    SessionInitResponse,
    StateResponse,
    HistoryResponse,
    LogsResponse,
    StepRequest,
    ResetRequest,
    UpdateParamsRequest
} from './generated-client';
