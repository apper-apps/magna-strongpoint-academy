import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({
  className,
  variant = "default",
  children,
  ...props
}, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 border border-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 dark:text-primary-400",
    accent: "bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700 border border-accent-200 dark:from-accent-900/20 dark:to-accent-800/20 dark:text-accent-400",
    success: "bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-400",
    warning: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-400",
    error: "bg-gradient-to-r from-red-100 to-red-200 text-red-700 border border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-400",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200 dark:from-gray-800 dark:to-gray-700 dark:text-gray-300"
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;