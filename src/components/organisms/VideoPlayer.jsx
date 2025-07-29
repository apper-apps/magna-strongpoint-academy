import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";

const VideoPlayer = ({ videoId, className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [videoId]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  const embedUrl = `https://video.adilo.com/${videoId}`;

  return (
    <div className={cn("relative w-full", className)}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center z-10">
          <Loading type="skeleton" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center z-10">
          <div className="text-center space-y-4">
            <ApperIcon name="AlertCircle" className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                영상을 불러올 수 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                잠시 후 다시 시도해주세요
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="video-container">
        <iframe
          src={embedUrl}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          className={cn(
            "transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100"
          )}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;