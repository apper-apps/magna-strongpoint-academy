import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  className,
  title = "아직 내용이 없습니다",
  description = "첫 번째 항목을 추가해보세요.",
  actionLabel = "시작하기",
  onAction,
  icon = "Plus"
}) => {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
          <ApperIcon 
            name={icon} 
            className="w-10 h-10 text-gray-400 dark:text-gray-500" 
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>

        {onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium rounded-lg transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ApperIcon name={icon} className="w-4 h-4" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default Empty;