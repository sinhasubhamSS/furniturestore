type Props = {
  value: boolean;
  onChange: (val: boolean) => void;
};

const VisibilityToggle = ({ value, onChange }: Props) => (
  <div className="space-y-2">
    <label className="block font-medium">Visibility</label>
    <div className="flex gap-4">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={value === true}
          onChange={() => onChange(true)}
        />
        Public
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={value === false}
          onChange={() => onChange(false)}
        />
        Private
      </label>
    </div>
  </div>
);

export default VisibilityToggle;
