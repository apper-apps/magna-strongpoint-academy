import { useState, useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import { courseService } from "@/services/api/courseService";
import { courseSeriesService } from "@/services/api/courseSeriesService";
import { uiUpdateService } from "@/services/api/uiUpdateService";

const VideoPlayer = ({ videoId, courseId, onComplete, onNextLesson, className }) => {
  const [loading, setLoading] = useState(true);
const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [seriesConfig, setSeriesConfig] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [nextButtonText, setNextButtonText] = useState("다음 수업");
  const [showNextButton, setShowNextButton] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState(null);
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
    setShowNextButton(false);
    progressTrackingRef.current.hasTriggeredCompletion = false;
    
    // Clear any existing auto-play timer
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
      setAutoPlayTimer(null);
    }
    
    // Load series configuration and UI settings
    loadSeriesConfig();
  }, [videoId, courseId]);

  useEffect(() => {
    return () => {
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
      }
    };
  }, [autoPlayTimer]);

  const loadSeriesConfig = async () => {
    if (!courseId) return;
    
    try {
      // Load series configuration
      const config = await courseSeriesService.getByCourseId(courseId);
      setSeriesConfig(config);
      
      // Load UI text configuration
      const buttonText = await uiUpdateService.getNextButtonText(courseId);
      setNextButtonText(buttonText);
      
      // Load next lesson if auto-play is enabled
      if (config?.autoPlayNext) {
        const next = await courseService.getNextLesson(courseId, videoId);
        setNextLesson(next);
      }
    } catch (error) {
      console.error("Error loading series configuration:", error);
    }
  };
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
          
          // Handle next lesson logic
          handleLessonComplete();
        }
      }
    } catch (error) {
      console.error('Progress tracking error:', error);
    }
};

  const handleLessonComplete = async () => {
    if (seriesConfig?.autoPlayNext && nextLesson) {
      // Auto-play next lesson after 3 seconds
      const timer = setTimeout(() => {
        if (onNextLesson) {
          onNextLesson(nextLesson);
        }
      }, 3000);
      setAutoPlayTimer(timer);
    } else if (nextLesson) {
      // Show next button if there's a next lesson but auto-play is disabled
      setShowNextButton(true);
    }
  };

  const handleNextLesson = () => {
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
      setAutoPlayTimer(null);
    }
    
    if (nextLesson && onNextLesson) {
      onNextLesson(nextLesson);
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

      {/* Series Progress Indicator */}
      {seriesConfig?.showSeriesProgress && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
            시리즈 진행률: {Math.round(progress)}%
          </div>
        </div>
      )}

      {/* Auto-play Countdown */}
      {isCompleted && seriesConfig?.autoPlayNext && nextLesson && autoPlayTimer && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ApperIcon name="Play" className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              다음 수업 자동 재생
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              3초 후 "{nextLesson.title}"이 자동으로 시작됩니다
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextLesson}
              >
                지금 시작
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearTimeout(autoPlayTimer);
                  setAutoPlayTimer(null);
                }}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Next Lesson Button */}
      {isCompleted && showNextButton && nextLesson && !seriesConfig?.autoPlayNext && (
        <div className="absolute bottom-4 right-4 z-20">
          <Button
            variant="primary"
            onClick={handleNextLesson}
            rightIcon="ArrowRight"
          >
            {nextButtonText}
          </Button>
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