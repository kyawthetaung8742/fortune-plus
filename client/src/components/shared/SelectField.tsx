import { Label } from "@/components/ui/label";
import { UseFormRegisterReturn } from "react-hook-form";

type Option = {
  value: string | number;
  label: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  value: string | number;
  options: Option[];
  error?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
};

const SelectField = ({
  id,
  label,
  value,
  options,
  error,
  required = true,
  register,
}: SelectFieldProps) => {
  return (
    <div>
      <Label htmlFor={id} className="mb-1">
        {required && (
          <span className="bg-red-500 px-1 rounded text-white">Required</span>
        )}
        {label}:
      </Label>
      <select
        id={id}
        value={value}
        {...register}
        className={`w-full border rounded px-3 py-2 mt-1 text-sm ${
          error ? "border-red-500" : ""
        }`}
      >
        <option value="0">-- Select {label} --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default SelectField;
