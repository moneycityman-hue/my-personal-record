"use client";

const COLORS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Soft Yellow", value: "#FEF3C7" },
  { label: "Soft Green", value: "#DCFCE7" },
  { label: "Soft Blue", value: "#DBEAFE" },
  { label: "Soft Pink", value: "#FCE7F3" },
  { label: "Soft Purple", value: "#EDE9FE" }
];

type ColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ColorPicker({ onChange, value }: ColorPickerProps) {
  return (
    <div className="color-row" role="radiogroup" aria-label="메모 배경색">
      {COLORS.map((color) => (
        <button
          aria-checked={value === color.value}
          aria-label={color.label}
          className={`color-swatch ${value === color.value ? "selected" : ""}`}
          key={color.value}
          onClick={() => onChange(color.value)}
          role="radio"
          style={{ background: color.value }}
          type="button"
        />
      ))}
    </div>
  );
}
