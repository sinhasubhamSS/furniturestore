import React from "react";

type Spec = { key: string; value: string };
type Props = {
  specs: Spec[];
  onChange: (updated: Spec[]) => void;
};

const SpecificationsField = ({ specs, onChange }: Props) => {
  const handleChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...specs];
    updated[index][field] = value;
    onChange(updated);
  };

  const addSpec = () => onChange([...specs, { key: "", value: "" }]);

  return (
    <div className="space-y-1">
      <label className="font-medium">Specifications</label>
      {specs.map((spec, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input
            value={spec.key}
            onChange={(e) => handleChange(idx, "key", e.target.value)}
            placeholder="Key"
            className="flex-1 border px-2 py-1 rounded"
          />
          <input
            value={spec.value}
            onChange={(e) => handleChange(idx, "value", e.target.value)}
            placeholder="Value"
            className="flex-1 border px-2 py-1 rounded"
          />
        </div>
      ))}
      <button type="button" onClick={addSpec} className="text-blue-600 text-sm">
        + Add Specification
      </button>
    </div>
  );
};

export default SpecificationsField;
