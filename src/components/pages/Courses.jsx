import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import CourseCard from "@/components/organisms/CourseCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/api/courseService";

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const categories = [
    { value: "all", label: "전체" },
    { value: "강점 찾기", label: "강점 찾기" },
    { value: "콘셉트 설계", label: "콘셉트 설계" },
    { value: "글 시나리오", label: "글 시나리오" },
    { value: "수익화 실행", label: "수익화 실행" }
  ];

  const levels = [
    { value: "all", label: "전체 레벨" },
    { value: "초급", label: "초급" },
    { value: "중급", label: "중급" },
    { value: "고급", label: "고급" }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, selectedCategory, selectedLevel]);

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await courseService.getAll();
      setCourses(data);
    } catch (err) {
      setError("강의를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== "all") {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadCourses} />;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              강의 목록
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              4단계 학습 과정을 통해 강점을 수익으로 만들어보세요
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              총 {filteredCourses.length}개 강의
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="강의명, 강사명으로 검색..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <Empty
          title="검색 결과가 없습니다"
          description="다른 검색어나 필터를 시도해보세요."
          icon="Search"
          actionLabel="필터 초기화"
          onAction={() => {
            setSearchQuery("");
            setSelectedCategory("all");
            setSelectedLevel("all");
          }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <CourseCard
                course={course}
                userRole={user?.role}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

{/* Upgrade CTA */}
      {user?.role === "Free_User" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-600"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto">
              <ApperIcon name="Crown" className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              더 많은 강의를 원하시나요?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              프리미엄으로 업그레이드하고 전체 강의를 수강하세요. 2-4단계 심화 과정과 마스터 전용 콘텐츠까지!
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                variant="primary" 
                size="lg" 
                rightIcon="ArrowRight"
                onClick={() => window.location.href = '/membership'}
              >
                프리미엄 업그레이드
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = '/membership'}
              >
                요금제 비교
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Courses;