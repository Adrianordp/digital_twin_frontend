import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import type { LegendPayload } from 'recharts';

interface SimulationChartProps {
    data: Array<{ [key: string]: number | string }>;
}

import React, { useState } from 'react';

const SimulationChart: React.FC<SimulationChartProps> = ({ data }) => {
    const keysToExclude = ['time', 't', 'step', 'step_count', 'simulation_time'];
    const lines = Object.keys(data[0] || {}).filter(key => !keysToExclude.includes(key.toLowerCase()));

    // Find the time field - it could be 'time', 't', 'step', or similar
    const timeKey = Object.keys(data[0] || {}).find(key =>
        ['time', 't', 'step', 'step_count', 'simulation_time'].includes(key.toLowerCase())
    ) || 'step'; // Default to 'step' since we add it in the container

    // Interactive: allow toggling lines
    const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
    // Recharts Legend onClick passes (data: LegendPayload, index: number)
    const handleLegendClick = (data: LegendPayload) => {
        const dataKey = data && data.dataKey;
        if (!dataKey || typeof dataKey !== 'string') return;
        setHiddenKeys((prev) =>
            prev.includes(dataKey) ? prev.filter((k) => k !== dataKey) : [...prev, dataKey]
        );
    };

    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeKey} minTickGap={10} />
                    <YAxis allowDecimals domain={['auto', 'auto']} />
                    <Tooltip
                        isAnimationActive={false}
                        formatter={(value: number | string, name: string) => [value, name]}
                        labelFormatter={(label: string | number) => `${timeKey}: ${label}`}
                    />
                    <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />
                    {lines.map((key, index) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={getColor(index)}
                            dot={false}
                            isAnimationActive={false}
                            hide={hiddenKeys.includes(key)}
                        />
                    ))}
                    <Brush dataKey={timeKey} height={24} stroke="#8884d8" travellerWidth={8} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

function getColor(index: number): string {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];
    return colors[index % colors.length];
}

export default SimulationChart;
