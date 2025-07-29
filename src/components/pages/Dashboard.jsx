import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { challengeService } from "@/services/api/challengeService";
import { communityService } from "@/services/api/communityService";
import { courseService } from "@/services/api/courseService";
import ApperIcon from "@/components/ApperIcon";
import ProgressRing from "@/components/molecules/ProgressRing";
import RoleBadge from "@/components/molecules/RoleBadge";
import CourseCard from "@/components/organisms/CourseCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
const Dashboard = () => {
  const { user } = useAuth();
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [showNextCourseBanner, setShowNextCourseBanner] = useState(false);
  const [nextCourse, setNextCourse] = useState(null);
  const [monthlyChallenge, setMonthlyChallenge] = useState(null);
  const [userParticipation, setUserParticipation] = useState(null);
  const [challengeLeaderboard, setChallengeLeaderboard] = useState([]);

useEffect(() => {
    loadDashboardData();
    loadChallengeData();
    
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

  const loadChallengeData = async () => {
    if (!user?.Id) return;
    
    try {
      // Get current monthly challenge
      const challenge = await challengeService.getCurrentChallenge();
      if (challenge) {
        setMonthlyChallenge(challenge);
        
        // Get user's participation in this challenge
        const participation = await challengeService.getUserParticipation(challenge.Id, user.Id);
        setUserParticipation(participation);
        
        // Get leaderboard
        const leaderboard = await challengeService.getLeaderboard(challenge.Id, 5);
        setChallengeLeaderboard(leaderboard);
      }
    } catch (error) {
      console.error("Error loading challenge data:", error.message);
    }
  };

const handleVideoComplete = async (completionData) => {
    // Show next course banner when video is completed
    setShowNextCourseBanner(true);
    localStorage.setItem('showNextCourseBanner', 'true');
    
    // Update challenge progress when video is completed
    if (monthlyChallenge && user?.Id) {
      const updatedParticipation = await challengeService.incrementUserProgress(user.Id, monthlyChallenge.Id);
      if (updatedParticipation) {
        setUserParticipation(updatedParticipation);
        // Refresh leaderboard
        const leaderboard = await challengeService.getLeaderboard(monthlyChallenge.Id, 5);
        setChallengeLeaderboard(leaderboard);
      }
    }
    
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

      {/* Monthly Challenge Widget */}
      {monthlyChallenge && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg border-2 border-gradient-to-r from-primary-200 to-accent-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl flex items-center justify-center">
                <ApperIcon name="Trophy" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  월간 챌린지
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })} - 영상 4개 완주하기
                </p>
              </div>
            </div>
            <Badge variant={userParticipation?.completed ? "success" : "primary"}>
              {userParticipation?.completed ? "완료" : "진행중"}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Progress Section */}
            <div className="flex items-center gap-4">
              <ProgressRing 
                progress={userParticipation ? (userParticipation.progress / 4) * 100 : 0}
                size={80}
                strokeWidth={8}
              />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userParticipation?.progress || 0}/4
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  영상 완료
                </div>
                {userParticipation?.completed && (
                  <div className="text-sm text-accent-600 dark:text-accent-400 font-medium">
                    🎉 챌린지 완료!
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">리더보드 Top 5</h4>
              <div className="space-y-2">
                {challengeLeaderboard.slice(0, 5).map((participant) => (
                  <div key={participant.participationId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {participant.rank}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {participant.userName}
                      </span>
                      <RoleBadge role={participant.userRole} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {participant.progress}/4
                      </span>
                      {participant.completed && (
                        <ApperIcon name="CheckCircle" className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
                {challengeLeaderboard.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    아직 참가자가 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      )}

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