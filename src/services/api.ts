// API client for Dual-System Digital Twin backend
// This file will contain all functions and types for backend communication

const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export class DigitalTwinApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = DEFAULT_API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    setBaseUrl(url: string) {
        this.baseUrl = url;
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
        const response = await fetch(`${this.baseUrl}/simulate/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model_name, params }),
        });

        if (!response.ok) {
            throw new Error(`Failed to initialize simulation: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Advance the simulation by one step.
     */
    async stepSimulation(
        session_id: string,
        control_input: number,
        delta_time?: number
    ): Promise<StateResponse> {
        const response = await fetch(`${this.baseUrl}/simulate/step`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id, control_input, delta_time }),
        });

        if (!response.ok) {
            throw new Error(`Failed to step simulation: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get the current state of a simulation session.
     */
    async getState(session_id: string): Promise<StateResponse> {
        const response = await fetch(`${this.baseUrl}/simulate/state/${session_id}`);

        if (!response.ok) {
            throw new Error(`Failed to get state: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get the history of a simulation session.
     */
    async getHistory(session_id: string): Promise<HistoryResponse> {
        const response = await fetch(`${this.baseUrl}/simulate/history/${session_id}`);

        if (!response.ok) {
            throw new Error(`Failed to get history: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get the logs of a simulation session.
     */
    async getLogs(session_id: string): Promise<LogsResponse> {
        const response = await fetch(`${this.baseUrl}/simulate/logs/${session_id}`);

        if (!response.ok) {
            throw new Error(`Failed to get logs: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Reset a simulation session, optionally with new parameters.
     */
    async resetSimulation(
        session_id: string,
        params?: Record<string, unknown> | null
    ): Promise<StateResponse> {
        const response = await fetch(`${this.baseUrl}/simulate/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id, params }),
        });

        if (!response.ok) {
            throw new Error(`Failed to reset simulation: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Update model parameters for a simulation session.
     */
    async updateParams(
        session_id: string,
        params: Record<string, unknown>
    ): Promise<StateResponse> {
        const response = await fetch(`${this.baseUrl}/simulate/params`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id, params }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update params: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
}

export const apiClient = new DigitalTwinApiClient();

// --- TypeScript interfaces for API requests and responses ---

// Session initialization
export interface SessionInitRequest {
    model_name: string; // e.g., 'water_tank' or 'room_temperature'
    params?: Record<string, unknown> | null;
}

export interface SessionInitResponse {
    session_id: string; // UUID
}

// Step simulation
export interface StepRequest {
    session_id: string;
    control_input: number;
    delta_time?: number;
}

// State response
export interface StateResponse {
    state: Record<string, unknown>;
}

// History response
export interface HistoryResponse {
    history: Record<string, unknown>[];
}

// Logs response
export interface LogsResponse {
    logs: string[];
}

// Reset simulation
export interface ResetRequest {
    session_id: string;
    params?: Record<string, unknown> | null;
}

// Update params
export interface UpdateParamsRequest {
    session_id: string;
    params: Record<string, unknown>;
}
