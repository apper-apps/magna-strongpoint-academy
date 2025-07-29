import { cn } from "@/utils/cn";

const Loading = ({ className, type = "page" }) => {
  if (type === "skeleton") {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-5/6"></div>
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl h-48 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-accent-500 rounded-full animate-spin animation-delay-75"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            로딩 중...
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loading;