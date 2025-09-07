import React, { useEffect, useState, useContext, useCallback } from 'react';
import SimulationChart from './SimulationChart';
import { apiClient } from '../services/api-client';
import SessionContext from '../context/SessionContext';

interface SimulationChartContainerProps {
    refreshTrigger?: number;
}

const SimulationChartContainer: React.FC<SimulationChartContainerProps> = React.memo(({ refreshTrigger = 0 }) => {
    const session = useContext(SessionContext);
    const sessionId = session?.sessionId;
    const [data, setData] = useState<Array<{ [key: string]: number | string }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshChart = useCallback(() => {
        if (!sessionId) return;
        setLoading(true);
        setError(null);
        console.log('Fetching history for session:', sessionId);
        apiClient.getHistory(sessionId)
            .then((history) => {
                console.log('History response:', history);
                console.log('History data array:', history.history);
                console.log('First history item:', history.history?.[0]);
                console.log('History data length:', history.history?.length);

                // Transform the history data to add time/step information if missing
                const transformedData = (history.history || []).map((item, index) => {
                    // If the item doesn't have a time field, add one based on the index
                    if (!('time' in item) && !('t' in item) && !('step' in item)) {
                        return { ...item, step: index };
                    }
                    return item;
                });

                console.log('Transformed data:', transformedData);
                setData(transformedData);
            })
            .catch((err) => {
                console.error('History fetch error:', err);
                setError(err.message || 'Failed to fetch history');
            })
            .finally(() => setLoading(false));
    }, [sessionId]);

    useEffect(() => {
        refreshChart();
    }, [refreshChart, refreshTrigger]);

    if (!sessionId) {
        return <div>No session selected.</div>;
    }
    if (loading) {
        return <div>Loading chart...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    if (!data.length) {
        return <div>No history data available.</div>;
    }
    return (
        <div>
            <button onClick={refreshChart}>Refresh</button>
            <SimulationChart data={data} />
        </div>
    );
});

SimulationChartContainer.displayName = 'SimulationChartContainer';

export default SimulationChartContainer;
