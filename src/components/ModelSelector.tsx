export type ModelOption = {
  value: string;
  label: string;
  description?: string;
};

export interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

import { apiClient } from '../services/api-client';
import { useSession } from '../context/useSession';

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { setSessionId } = useSession();
  const options: ModelOption[] = [
    { value: 'water_tank', label: 'Water Tank', description: 'Simple tank with inflow/outflow dynamics.' },
    { value: 'room_temperature', label: 'Room Temperature', description: 'Thermal model controlling temperature over time.' },
  ];

  function handleChange(modelName: string) {
    // Update selected model immediately (UI update)
    onChange(modelName);

    // Create a new simulation session/section for the selected model.
    // Fire-and-forget: do not block the UI on initialization.
    (async () => {
      try {
        const res = await apiClient.initSimulation(modelName, null);
        if (res?.sessionId) {
          setSessionId(res.sessionId);
        }
      } catch (err) {
        // Log error; SimulationInitializer covers the full init flow.
        // eslint-disable-next-line no-console
        console.error('Failed to auto-initialize simulation for model', modelName, err);
      }
    })();
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-medium text-gray-800">Choose a model</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-md border ${value === opt.value ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
            <input
              type="radio"
              name="model"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => handleChange(opt.value)}
              className="mt-1 h-4 w-4 accent-blue-600"
            />
            <div>
              <div className="text-sm font-semibold text-gray-800">{opt.label}</div>
              {opt.description && <div className="text-xs text-gray-600 mt-1">{opt.description}</div>}
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
