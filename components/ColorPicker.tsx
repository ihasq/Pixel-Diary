import React from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

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
    </div>
  );
};