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

    // TODO: Implement endpoint methods here
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
