// components/admin/product/SpecificationForm.tsx
"use client";

import React, { useState } from "react";
import { Specification } from "@/types/Product";

const SpecificationForm = ({
  onChange,
}: {
  onChange: (data: Specification[]) => void;
}) => {
  const [specifications, setSpecifications] = useState<Specification[]>([]);

  const updateForm = (updated: Specification[]) => {
    setSpecifications(updated);
    // sanitize before sending: trim strings
    const sanitized = updated
      .map((s) => ({
        section: (s.section ?? "").toString().trim(),
        specs: (s.specs ?? []).map((sp) => ({
          key: (sp.key ?? "").toString().trim(),
          value: (sp.value ?? "").toString().trim(),
        })),
      }))
      .filter(
        (s) =>
          s.section.length > 0 && Array.isArray(s.specs) && s.specs.length > 0
      );
    onChange(sanitized);
  };

  const addSection = () =>
    updateForm([
      ...specifications,
      { section: "", specs: [{ key: "", value: "" }] },
    ]);

  const removeSection = (index: number) => {
    const updated = [...specifications];
    updated.splice(index, 1);
    updateForm(updated);
  };

  const updateSection = (index: number, value: string) => {
    const updated = [...specifications];
    updated[index].section = value;
    updateForm(updated);
  };

  const addSpec = (sectionIndex: number) => {
    const updated = [...specifications];
    updated[sectionIndex].specs.push({ key: "", value: "" });
    updateForm(updated);
  };

  const updateSpec = (
    sectionIndex: number,
    specIndex: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...specifications];
    updated[sectionIndex].specs[specIndex][field] = value;
    updateForm(updated);
  };

  const removeSpec = (sectionIndex: number, specIndex: number) => {
    const updated = [...specifications];
    updated[sectionIndex].specs.splice(specIndex, 1);
    updateForm(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Specifications</h2>
      {specifications.map((section, i) => (
        <div key={i} className="border p-4 rounded bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              value={section.section}
              onChange={(e) => updateSection(i, e.target.value)}
              placeholder="Section name"
              className="border p-2 w-full rounded"
              // prevent Enter from accidentally submitting parent form
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
            />
            {/* explicit type="button" so this does NOT submit the form */}
            <button
              type="button"
              onClick={() => removeSection(i)}
              className="ml-2 text-red-500"
            >
              Remove Section
            </button>
          </div>

          {section.specs.map((spec, j) => (
            <div key={j} className="flex gap-2 mb-2">
              <input
                type="text"
                value={spec.key}
                onChange={(e) => updateSpec(i, j, "key", e.target.value)}
                placeholder="Key"
                className="border p-2 w-1/2 rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => updateSpec(i, j, "value", e.target.value)}
                placeholder="Value"
                className="border p-2 w-1/2 rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
              <button
                type="button"
                onClick={() => removeSpec(i, j)}
                className="text-red-500"
              >
                X
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addSpec(i)}
            className="mt-2 text-blue-500 text-sm"
          >
            + Add Spec
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Add Section
      </button>
    </div>
  );
};

export default SpecificationForm;
