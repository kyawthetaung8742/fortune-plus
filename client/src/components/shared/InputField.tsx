import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegisterReturn } from "react-hook-form";

type InputFieldProps = {
  id: string;
  label: string;
  type?: string;
  registerProps: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
};

const InputField = ({
  id,
  label,
  type = "text",
  registerProps,
  error,
  required = true,
}: InputFieldProps) => {
  return (
    <div>
      <Label htmlFor={id} className="mb-1">
        {required && (
          <span className="bg-red-500 px-1 rounded text-white">Required</span>
        )}
        {label}:
      </Label>
      <Input
        id={id}
        type={type}
        {...registerProps}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default InputField;
