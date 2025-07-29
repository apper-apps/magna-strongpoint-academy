import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  className, 
  message = "오류가 발생했습니다.", 
  onRetry,
  showRetry = true 
}) => {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center">
          <ApperIcon 
            name="AlertTriangle" 
            className="w-10 h-10 text-red-600 dark:text-red-400" 
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            문제가 발생했습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {message}
          </p>
        </div>

        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-lg transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ApperIcon name="RotateCcw" className="w-4 h-4" />
            다시 시도
          </button>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-500">
          문제가 계속되면 고객지원팀에 문의해주세요.
        </p>
      </div>
    </div>
  );
};

export default Error;