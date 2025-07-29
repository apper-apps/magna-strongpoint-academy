import { cn } from "@/utils/cn";
import Input from "@/components/atoms/Input";

const FormField = ({
  label,
  error,
  required = false,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children || <Input error={error} {...props} />}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormField;