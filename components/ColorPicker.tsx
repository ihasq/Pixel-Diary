import React from 'react';
import { Icon } from './Icon';

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

const PRESETS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#ffffff', // White
  '#9ca3af', // Gray
  '#000000', // Black
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onChange }) => {
  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-sm font-medium uppercase tracking-wider">Color Palette</span>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 pr-3 border border-gray-300">
           <input
            type="color"
            value={selectedColor}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
          />
          <span className="text-sm font-mono text-gray-700 uppercase">{selectedColor}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {PRESETS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
              selectedColor === color ? 'border-gray-900 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};