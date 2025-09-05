export type SessionContextValue = {
    selectedModel: string;
    setSelectedModel: (m: string) => void;
    sessionId: string | null;
    setSessionId: (id: string | null) => void;
};
