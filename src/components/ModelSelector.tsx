export type ModelOption = {
  value: string;
  label: string;
  description?: string;
};

export interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const options: ModelOption[] = [
    { value: 'water_tank', label: 'Water Tank', description: 'Simple tank with inflow/outflow dynamics.' },
    { value: 'room_temperature', label: 'Room Temperature', description: 'Thermal model controlling temperature over time.' },
  ];

  function handleChange(modelName: string) {
    onChange(modelName);
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
              className="mt-1 h-4 w-4 text-blue-600"
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
