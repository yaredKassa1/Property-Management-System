'use client';

import { useState } from 'react';

interface AdministrativeWingFormProps {
  formData: any;
  errors: Record<string, string>;
  onFormDataChange: (field: string, value: string) => void;
  adminUnits: string[];
  onAddUnit: (unit: string) => void;
}

export function AdministrativeWingForm({
  formData,
  errors,
  onFormDataChange,
  adminUnits,
  onAddUnit,
}: AdministrativeWingFormProps) {
  const [newUnit, setNewUnit] = useState('');
  const [showNewUnit, setShowNewUnit] = useState(false);

  const handleAddUnit = () => {
    if (newUnit.trim()) {
      onAddUnit(newUnit);
      setNewUnit('');
      setShowNewUnit(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Administrative Unit Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Administrative Unit *
        </label>
        <div className="flex gap-2">
          <select
            value={formData.administrativeUnit}
            onChange={(e) => {
              const value = e.target.value;
              onFormDataChange('administrativeUnit', value);
            }}
            className={`flex-1 px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.administrativeUnit ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Administrative Unit</option>
            {adminUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewUnit(!showNewUnit)}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            title="Add new administrative unit"
          >
            +
          </button>
        </div>
        {showNewUnit && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              placeholder="Enter new administrative unit name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleAddUnit}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add
            </button>
          </div>
        )}
        {errors.administrativeUnit && (
          <p className="text-red-500 text-xs mt-1">{errors.administrativeUnit}</p>
        )}
      </div>
    </div>
  );
}
