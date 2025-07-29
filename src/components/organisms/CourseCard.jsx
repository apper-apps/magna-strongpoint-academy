import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import RoleBadge from "@/components/molecules/RoleBadge";
import ApperIcon from "@/components/ApperIcon";
import { courseService } from "@/services/api/courseService";

const CourseCard = ({ course, userRole = "Free_User", className }) => {
  const [loading, setLoading] = useState(false);

  const canAccess = () => {
    const roleHierarchy = { "Free_User": 0, "Premium": 1, "Master": 2 };
    return roleHierarchy[userRole] >= roleHierarchy[course.requiredRole];
  };

  const handleEnroll = async () => {
    if (!canAccess()) {
      toast.info("프리미엄 업그레이드가 필요합니다!");
      return;
    }

    setLoading(true);
    try {
      await courseService.enrollInCourse(course.Id, 1);
      toast.success("강의 등록이 완료되었습니다!");
    } catch (error) {
      toast.error("등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden group ${className}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Duration badge */}
        <div className="absolute bottom-4 right-4">
          <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
            <ApperIcon name="Clock" className="w-3 h-3 mr-1" />
            {formatDuration(course.duration)}
          </Badge>
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <ApperIcon name="Play" className="w-8 h-8 text-primary-600 ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {course.category}
            </Badge>
            <RoleBadge role={course.requiredRole} />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {course.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <ApperIcon name="Star" className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{course.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <ApperIcon name="Users" className="w-4 h-4" />
            <span>{course.studentsCount?.toLocaleString()}명</span>
          </div>
          <div className="flex items-center gap-1">
            <ApperIcon name="User" className="w-4 h-4" />
            <span>{course.instructor}</span>
          </div>
        </div>

        {/* Video count */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <ApperIcon name="PlayCircle" className="w-4 h-4" />
          <span>{course.videos?.length || 0}개 강의</span>
          <span className="text-gray-400">•</span>
          <span className="capitalize">{course.level}</span>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Button
            onClick={handleEnroll}
            loading={loading}
            disabled={loading}
            variant={canAccess() ? "primary" : "outline"}
            className="w-full"
            rightIcon={canAccess() ? "Play" : "Lock"}
          >
            {canAccess() ? "강의 시작" : "업그레이드 필요"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;