import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SimulationChart from '../src/components/SimulationChart';

interface MockChartProps {
    children?: React.ReactNode;
    data?: Array<{ [key: string]: number | string }>;
}

interface MockLineProps {
    dataKey?: string;
    stroke?: string;
}

interface MockAxisProps {
    dataKey?: string;
}

interface MockGridProps {
    strokeDasharray?: string;
}

// Mock recharts to avoid canvas/SVG rendering issues in tests
vi.mock('recharts', () => ({
    LineChart: ({ children, data }: MockChartProps) => (
        <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
            {children}
        </div>
    ),
    Line: ({ dataKey, stroke }: MockLineProps) => (
        <div data-testid="line" data-key={dataKey} data-stroke={stroke} />
    ),
    XAxis: ({ dataKey }: MockAxisProps) => (
        <div data-testid="x-axis" data-key={dataKey} />
    ),
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: ({ strokeDasharray }: MockGridProps) => (
        <div data-testid="grid" data-stroke-dasharray={strokeDasharray} />
    ),
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    ResponsiveContainer: ({ children }: MockChartProps) => (
        <div data-testid="responsive-container">{children}</div>
    ),
    Brush: (props: Record<string, unknown>) => <div data-testid="mock-brush" {...props} />, // Add mock for Brush
}));

describe('SimulationChart', () => {
    const mockData = [
        { time: 0, value: 10 },
        { time: 1, value: 15 },
        { time: 2, value: 12 },
        { time: 3, value: 18 },
    ];

    it('renders the chart with basic components', () => {
        render(<SimulationChart data={mockData} />);

        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('x-axis')).toBeInTheDocument();
        expect(screen.getByTestId('y-axis')).toBeInTheDocument();
        expect(screen.getByTestId('grid')).toBeInTheDocument();
        expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        expect(screen.getByTestId('legend')).toBeInTheDocument();
        expect(screen.getByTestId('line')).toBeInTheDocument();
    });

    it('passes data correctly to the chart', () => {
        render(<SimulationChart data={mockData} />);

        const chart = screen.getByTestId('line-chart');
        expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(mockData));
    });

    it('configures X-axis with time dataKey', () => {
        render(<SimulationChart data={mockData} />);

        const xAxis = screen.getByTestId('x-axis');
        expect(xAxis).toHaveAttribute('data-key', 'time');
    });

    it('configures line with value dataKey and correct stroke', () => {
        render(<SimulationChart data={mockData} />);

        const line = screen.getByTestId('line');
        expect(line).toHaveAttribute('data-key', 'value');
        expect(line).toHaveAttribute('data-stroke', '#8884d8');
    });

    it('configures grid with correct stroke pattern', () => {
        render(<SimulationChart data={mockData} />);

        const grid = screen.getByTestId('grid');
        expect(grid).toHaveAttribute('data-stroke-dasharray', '3 3');
    });

    it('renders with empty data', () => {
        render(<SimulationChart data={[]} />);

        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('handles complex data with multiple properties', () => {
        const complexData = [
            { time: 0, value: 10, temperature: 25, pressure: 1013 },
            { time: 1, value: 15, temperature: 27, pressure: 1012 },
        ];

        render(<SimulationChart data={complexData} />);

        const chart = screen.getByTestId('line-chart');
        expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(complexData));
    });
});
