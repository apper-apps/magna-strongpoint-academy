import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import RoleBadge from "@/components/molecules/RoleBadge";
import ProgressRing from "@/components/molecules/ProgressRing";
import CourseCard from "@/components/organisms/CourseCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/api/courseService";
import { communityService } from "@/services/api/communityService";

const Dashboard = () => {
  const { user } = useAuth();
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
  const [showNextCourseBanner, setShowNextCourseBanner] = useState(false);
  const [nextCourse, setNextCourse] = useState(null);

  useEffect(() => {
    loadDashboardData();
    
    // Check if banner should be shown (from localStorage or app state)
    const shouldShowBanner = localStorage.getItem('showNextCourseBanner') === 'true';
    if (shouldShowBanner) {
      setShowNextCourseBanner(true);
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
setError("");
    
    try {
      const [coursesData, postsData] = await Promise.all([
        courseService.getRecommended(user?.role),
        communityService.getPopular()
      ]);
      
      setRecommendedCourses(coursesData);
      setRecentPosts(postsData);
      
      // Set next course for banner
      if (coursesData.length > 0) {
        setNextCourse(coursesData[0]);
      }
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoComplete = (completionData) => {
    // Show next course banner when video is completed
    setShowNextCourseBanner(true);
    localStorage.setItem('showNextCourseBanner', 'true');
    
    // You could also trigger other actions here like updating user progress
    console.log('Video completed:', completionData);
  };

  const handleBannerClose = () => {
    setShowNextCourseBanner(false);
    localStorage.removeItem('showNextCourseBanner');
  };

  const handleGoToNextCourse = () => {
    if (nextCourse) {
      // Navigate to next course - in real app would use router
      console.log('Navigate to course:', nextCourse.Id);
      handleBannerClose();
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const progressPercentage = user?.progress 
    ? Math.round((user.progress.completedSteps / user.progress.totalSteps) * 100)
    : 0;

  const courseProgressPercentage = user?.progress
    ? Math.round((user.progress.coursesCompleted / user.progress.totalCourses) * 100)
    : 0;
return (
    <div className="p-6 space-y-8">
      {/* Next Course Banner */}
      {showNextCourseBanner && nextCourse && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden mb-6"
          id="next_course_banner"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-emerald-700/80"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <ApperIcon name="ArrowRight" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    다음 추천 과정으로 이동하세요!
                  </h3>
                  <p className="text-white/90">
                    {nextCourse.title} - 계속해서 학습을 진행해보세요
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={handleGoToNextCourse}
                  className="bg-white text-green-600 hover:bg-gray-100"
                >
                  이동하기
                </Button>
                <button
                  onClick={handleBannerClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <ApperIcon name="X" className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/80 to-accent-600/80"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold">
                  안녕하세요, {user?.name || "사용자"}님!
                </h1>
                <RoleBadge role={user?.role} />
              </div>
              <p className="text-white/90 text-lg">
                오늘도 강점을 발견하고 성장해보세요 ✨
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl md:text-4xl font-bold">
                {user?.progress?.streak || 0}일
              </div>
              <div className="text-white/90">연속 학습</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* 4-Step Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              학습 진도
            </h3>
            <ApperIcon name="Target" className="w-6 h-6 text-primary-500" />
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing progress={progressPercentage} size={60}>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {progressPercentage}%
              </span>
            </ProgressRing>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.progress?.completedSteps || 0}/4
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                단계 완료
              </div>
            </div>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              강의 수강
            </h3>
            <ApperIcon name="BookOpen" className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing progress={courseProgressPercentage} size={60}>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {courseProgressPercentage}%
              </span>
            </ProgressRing>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.progress?.coursesCompleted || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                강의 완료
              </div>
            </div>
          </div>
        </div>

        {/* Community Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              커뮤니티
            </h3>
            <ApperIcon name="Users" className="w-6 h-6 text-purple-500" />
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.progress?.communityPosts || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              작성한 게시글
            </div>
            <Button size="sm" variant="outline" className="w-full">
              글쓰기
            </Button>
          </div>
        </div>

        {/* Achievement */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              성취도
            </h3>
            <ApperIcon name="Award" className="w-6 h-6 text-accent-500" />
          </div>
          <div className="space-y-3">
            <Badge variant="accent" className="w-full justify-center py-2">
              <ApperIcon name="Star" className="w-4 h-4 mr-1" />
              열정적인 학습자
            </Badge>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              연속 {user?.progress?.streak || 0}일 학습 중!
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recommended Courses */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            추천 강의
          </h2>
          <Button variant="outline" rightIcon="ArrowRight">
            모든 강의 보기
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.slice(0, 3).map((course) => (
            <CourseCard
              key={course.Id}
              course={course}
              userRole={user?.role}
            />
          ))}
        </div>
      </motion.section>

      {/* Recent Community Activity */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            인기 커뮤니티 글
          </h2>
          <Button variant="outline" rightIcon="ArrowRight">
            커뮤니티 가기
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recentPosts.slice(0, 4).map((post) => (
            <div
              key={post.Id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.authorName?.[0] || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {post.authorName}
                    </h4>
                    <RoleBadge role={post.authorRole} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {post.content}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <ApperIcon name="Heart" className="w-4 h-4" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <ApperIcon name="MessageCircle" className="w-4 h-4" />
                    {post.comments}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  #{post.tags?.[0]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;