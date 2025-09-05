import { useContext } from 'react';
import type { SessionContextValue } from './types';
import SessionContext from './SessionContext';

export function useSession(): SessionContextValue {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession must be used within a SessionProvider');
    return ctx;
}

export default useSession;
