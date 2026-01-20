import { Input } from "@/components/ui/input";
import { cn } from "@/lib/frontend";

interface LabeledInputProps {
  label: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  showError?: boolean;
  className?: string;
}

export function LabeledInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  showError = false,
  className = "",
}: LabeledInputProps) {
  const isEmpty =
    typeof value === "string" ? value.trim() === "" : value === undefined;
  const shouldShowError = required && showError && isEmpty;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          "border p-2 rounded-md",
          shouldShowError && "border-red-500"
        )}
      />
      {shouldShowError && (
        <p className="text-red-500 text-xs">This field is required</p>
      )}
    </div>
  );
}
