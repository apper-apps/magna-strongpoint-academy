import { useState, useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import { courseService } from "@/services/api/courseService";

const VideoPlayer = ({ videoId, courseId, onComplete, className }) => {
  const [loading, setLoading] = useState(true);
const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const iframeRef = useRef(null);
  const progressTrackingRef = useRef({
    duration: 0,
    currentTime: 0,
    hasTriggeredCompletion: false
  });

  useEffect(() => {
    setLoading(true);
    setError(false);
    setProgress(0);
    setIsCompleted(false);
    progressTrackingRef.current.hasTriggeredCompletion = false;
  }, [videoId]);

  useEffect(() => {
    const interval = setInterval(() => {
      trackVideoProgress();
    }, 1000); // Check progress every second

    return () => clearInterval(interval);
  }, [courseId, onComplete]);

  const trackVideoProgress = async () => {
    if (!iframeRef.current || progressTrackingRef.current.hasTriggeredCompletion) return;

    try {
      // Simulate getting video data from iframe
      // In real implementation, this would communicate with the video player API
      const iframe = iframeRef.current;
      if (iframe.contentWindow) {
        // Mock progress calculation - in real app this would get actual video time
        const mockCurrentTime = Math.min(progressTrackingRef.current.currentTime + 1, 100);
        const mockDuration = 100; // Mock 100 seconds duration
        
        progressTrackingRef.current.currentTime = mockCurrentTime;
        progressTrackingRef.current.duration = mockDuration;
        
        const progressPercentage = (mockCurrentTime / mockDuration) * 100;
        setProgress(progressPercentage);

        // Check for 75% completion
        if (progressPercentage >= 75 && !progressTrackingRef.current.hasTriggeredCompletion) {
          progressTrackingRef.current.hasTriggeredCompletion = true;
          setIsCompleted(true);
          
          // Track progress in service
          if (courseId) {
            await courseService.trackVideoProgress(courseId, videoId, progressPercentage);
          }
          
          // Trigger completion callback
          if (onComplete) {
            onComplete({
              videoId,
              courseId,
              progress: progressPercentage,
              completed: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Progress tracking error:', error);
    }
  };

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

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-20 rounded-t-xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <ApperIcon name="CheckCircle" className="w-4 h-4" />
            완료
          </div>
        </div>
      )}

      <div className="video-container">
        <iframe
          ref={iframeRef}
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