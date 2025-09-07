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

    const firstModelRender = useRef(true);

    useEffect(() => {
        try {
            if (selectedModel) localStorage.setItem('selectedModel', selectedModel);
        } catch (e) {
            // Ignore localStorage errors
            void e;
        }
    }, [selectedModel]);

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
            // Ignore localStorage errors
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

