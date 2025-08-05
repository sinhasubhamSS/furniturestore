import React from "react";

type Props = {
  label: string;
  values: string[];
  onChange: (updated: string[]) => void;
};

const VariantsField = ({ label, values, onChange }: Props) => {
  const handleChange = (index: number, value: string) => {
    const updated = [...values];
    updated[index] = value;
    onChange(updated);
  };

  const addField = () => onChange([...values, ""]);

  return (
    <div className="space-y-1">
      <label className="font-medium">{label}</label>
      {values.map((val, idx) => (
        <input
          key={idx}
          value={val}
          onChange={(e) => handleChange(idx, e.target.value)}
          className="w-full border px-3 py-2 rounded mb-1"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ))}
      <button type="button" onClick={addField} className="text-blue-600 text-sm">
        + Add {label}
      </button>
    </div>
  );
};

export default VariantsField;
