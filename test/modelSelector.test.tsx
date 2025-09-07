import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModelSelector from '../src/components/ModelSelector';

vi.mock('../src/services/api-client', () => ({
    apiClient: {
        initSimulation: vi.fn(),
    },
}));

// Mock session hook to provide setSessionId
vi.mock('../src/context/useSession', () => ({
    useSession: () => ({ setSessionId: vi.fn() }),
}));

describe('ModelSelector', () => {
    it('renders model options correctly', () => {
        const mockOnChange = vi.fn();
        render(<ModelSelector value="water_tank" onChange={mockOnChange} />);

        // Check if the fieldset legend is present
        expect(screen.getByText('Choose a model')).toBeInTheDocument();

        // Check if both model options are present
        expect(screen.getByLabelText(/Water Tank/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Room Temperature/)).toBeInTheDocument();

        // Check if descriptions are shown
        expect(screen.getByText('Simple tank with inflow/outflow dynamics.')).toBeInTheDocument();
        expect(screen.getByText('Thermal model controlling temperature over time.')).toBeInTheDocument();
    });

    it('selects the correct initial value', () => {
        const mockOnChange = vi.fn();
        render(<ModelSelector value="room_temperature" onChange={mockOnChange} />);

        const waterTankRadio = screen.getByRole('radio', { name: /Water Tank/ });
        const roomTempRadio = screen.getByRole('radio', { name: /Room Temperature/ });

        expect(waterTankRadio).not.toBeChecked();
        expect(roomTempRadio).toBeChecked();
    });

    it('calls onChange when a different option is selected', () => {
        const mockOnChange = vi.fn();
        render(<ModelSelector value="water_tank" onChange={mockOnChange} />);

        const roomTempRadio = screen.getByRole('radio', { name: /Room Temperature/ });
        fireEvent.click(roomTempRadio);

        expect(mockOnChange).toHaveBeenCalledWith('room_temperature');
        expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('applies correct styling for selected option', () => {
        const mockOnChange = vi.fn();
        render(<ModelSelector value="water_tank" onChange={mockOnChange} />);

        const waterTankLabel = screen.getByLabelText(/Water Tank/).closest('label');
        const roomTempLabel = screen.getByLabelText(/Room Temperature/).closest('label');

        // Selected option should have blue border and background
        expect(waterTankLabel).toHaveClass('border-blue-300', 'bg-blue-50');

        // Unselected option should have gray border and white background
        expect(roomTempLabel).toHaveClass('border-gray-200', 'bg-white');
    });

    it('does not call onChange when already selected option is clicked', () => {
        const mockOnChange = vi.fn();
        render(<ModelSelector value="water_tank" onChange={mockOnChange} />);

        const waterTankRadio = screen.getByRole('radio', { name: /Water Tank/ });
        fireEvent.click(waterTankRadio);

        // Radio buttons don't trigger change when clicking already selected option
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('renders all model options with correct values', () => {
        const mockOnChange = vi.fn();
        render(<ModelSelector value="water_tank" onChange={mockOnChange} />);

        const waterTankRadio = screen.getByRole('radio', { name: /Water Tank/ }) as HTMLInputElement;
        const roomTempRadio = screen.getByRole('radio', { name: /Room Temperature/ }) as HTMLInputElement;

        expect(waterTankRadio.value).toBe('water_tank');
        expect(roomTempRadio.value).toBe('room_temperature');
    });

    it('uses the same name attribute for radio group', () => {
        const mockOnChange = vi.fn();
        render(<ModelSelector value="water_tank" onChange={mockOnChange} />);

        const radios = screen.getAllByRole('radio');
        radios.forEach(radio => {
            expect((radio as HTMLInputElement).name).toBe('model');
        });
    });
});
