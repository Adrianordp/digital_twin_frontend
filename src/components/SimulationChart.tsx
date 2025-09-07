import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SimulationChartProps {
    data: Array<{ [key: string]: number | string }>;
}

const SimulationChart: React.FC<SimulationChartProps> = ({ data }) => {
    console.log('SimulationChart received data:', data);
    console.log('Data length:', data.length);
    console.log('First data item:', data[0]);

    const keysToExclude = ['time', 't', 'step', 'step_count', 'simulation_time'];
    const lines = Object.keys(data[0] || {}).filter(key => !keysToExclude.includes(key.toLowerCase()));

    console.log('Available keys:', Object.keys(data[0] || {}));
    console.log('Lines to render:', lines);

    // Find the time field - it could be 'time', 't', 'step', or similar
    const timeKey = Object.keys(data[0] || {}).find(key =>
        ['time', 't', 'step', 'step_count', 'simulation_time'].includes(key.toLowerCase())
    ) || 'step'; // Default to 'step' since we add it in the container

    console.log('Using time key:', timeKey);

    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {lines.map((key, index) => (
                        <Line key={key} type="monotone" dataKey={key} stroke={getColor(index)} />
                    ))}
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
