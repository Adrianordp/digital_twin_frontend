import React, { useEffect, useState, useContext } from 'react';
import SimulationChart from './SimulationChart';
import { apiClient } from '../services/api-client';
import SessionContext from '../context/SessionContext';

const SimulationChartContainer: React.FC = () => {
    const session = useContext(SessionContext);
    const sessionId = session?.sessionId;
    const [data, setData] = useState<Array<{ [key: string]: number | string }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) return;
        setLoading(true);
        setError(null);
        apiClient.getHistory(sessionId)
            .then((history) => {
                // Use history.history as the array for the chart
                setData(history.history || []);
            })
            .catch((err) => {
                setError(err.message || 'Failed to fetch history');
            })
            .finally(() => setLoading(false));
    }, [sessionId]);

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
    return <SimulationChart data={data} />;
};

export default SimulationChartContainer;
