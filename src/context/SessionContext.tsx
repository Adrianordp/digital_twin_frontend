import { createContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import type { SessionContextValue } from './types';

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [selectedModel, setSelectedModel] = useState<string>(() => {
        try {
            const v = localStorage.getItem('selectedModel');
            return v ?? 'water_tank';
        } catch {
            return 'water_tank';
        }
    });

    const [sessionId, setSessionId] = useState<string | null>(() => {
        try {
            return localStorage.getItem('sessionId');
        } catch {
            return null;
        }
    });

    // Track first render so we don't clear an existing sessionId when
    // initializing selectedModel from localStorage on mount.
    const firstModelRender = useRef(true);

    useEffect(() => {
        try {
            if (selectedModel) localStorage.setItem('selectedModel', selectedModel);
        } catch (e) {
            // ignore localStorage errors
            void e;
        }
    }, [selectedModel]);

    // No-op for model change: sessionId is kept. Previously we cleared the
    // sessionId on model switch, but that caused UI flicker and discarded
    // sessions unexpectedly. Session lifecycle should be managed by the
    // initializer or the ModelSelector auto-init behavior.
    useEffect(() => {
        if (firstModelRender.current) {
            firstModelRender.current = false;
        }
    }, [selectedModel]);

    useEffect(() => {
        try {
            if (sessionId) localStorage.setItem('sessionId', sessionId);
            else localStorage.removeItem('sessionId');
        } catch (e) {
            // ignore localStorage errors
            void e;
        }
    }, [sessionId]);

    const value: SessionContextValue = {
        selectedModel,
        setSelectedModel,
        sessionId,
        setSessionId,
    };

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export default SessionContext;

