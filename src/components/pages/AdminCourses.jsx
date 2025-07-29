import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { courseService } from '@/services/api/courseService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import FormField from '@/components/molecules/FormField';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { cn } from '@/utils/cn';

const AdminCourses = () => {
  const { user } = useSelector((state) => state.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('CreatedOn');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Check user role access
  const hasAccess = user?.role === 'Admin' || user?.role === 'Master';

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category_slug: '',
    video_id: '',
    difficulty: '',
    description: ''
  });

  useEffect(() => {
    if (hasAccess) {
      fetchCourses();
    }
  }, [hasAccess, currentPage, sortBy, sortOrder, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "category_slug" } },
          { field: { Name: "video_id" } },
          { field: { Name: "difficulty" } },
          { field: { Name: "description" } }
        ],
        orderBy: [
          {
            fieldName: sortBy,
            sorttype: sortOrder
          }
        ],
        pagingInfo: {
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage
        }
      };

      if (searchTerm) {
        params.where = [
          {
            FieldName: "title",
            Operator: "Contains",
            Values: [searchTerm]
          }
        ];
      }

      const response = await courseService.getAll(params);
      
      if (response && response.data) {
        setCourses(response.data);
        const total = response.total || response.data.length;
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err.message);
      setError('강의 데이터를 불러오는데 실패했습니다.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setIsEditing(false);
    setFormData({
      title: '',
      category_slug: '',
      video_id: '',
      difficulty: '',
      description: ''
    });
    setIsDrawerOpen(true);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setIsEditing(true);
    setFormData({
      title: course.title || '',
      category_slug: course.category_slug || '',
      video_id: course.video_id || '',
      difficulty: course.difficulty || '',
      description: course.description || ''
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('정말로 이 강의를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await courseService.delete([courseId]);
      if (response) {
        toast.success('강의가 성공적으로 삭제되었습니다.');
        fetchCourses();
      }
    } catch (err) {
      console.error('Error deleting course:', err.message);
      toast.error('강의 삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isEditing && selectedCourse) {
        const response = await courseService.update([{
          Id: selectedCourse.Id || selectedCourse.id,
          ...formData
        }]);
        if (response) {
          toast.success('강의가 성공적으로 수정되었습니다.');
        }
      } else {
        const response = await courseService.create([formData]);
        if (response) {
          toast.success('강의가 성공적으로 생성되었습니다.');
        }
      }
      
      setIsDrawerOpen(false);
      fetchCourses();
    } catch (err) {
      console.error('Error saving course:', err.message);
      toast.error('강의 저장에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  // Access control check
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="Shield" className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            이 페이지에 접근하려면 관리자 권한이 필요합니다.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            강의 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            강의 콘텐츠를 생성, 수정, 삭제할 수 있습니다.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="강의 제목으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              onClick={handleCreate}
              className="btn-primary text-white px-6 py-2"
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              새 강의 추가
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('Id')}
                  >
                    <div className="flex items-center gap-2">
                      ID
                      {sortBy === 'Id' && (
                        <ApperIcon 
                          name={sortOrder === 'ASC' ? 'ChevronUp' : 'ChevronDown'} 
                          className="w-4 h-4" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      제목
                      {sortBy === 'title' && (
                        <ApperIcon 
                          name={sortOrder === 'ASC' ? 'ChevronUp' : 'ChevronDown'} 
                          className="w-4 h-4" 
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    비디오 ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    난이도
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                {courses.map((course) => (
                  <tr key={course.Id || course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {course.Id || course.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {course.title || 'Untitled'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {course.category_slug || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {course.video_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                        course.difficulty === 'beginner' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                        course.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                        course.difficulty === 'advanced' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                        !course.difficulty && "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                      )}>
                        {course.difficulty || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEdit(course)}
                          className="text-primary-600 hover:text-primary-800 p-1"
                          variant="ghost"
                        >
                          <ApperIcon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(course.Id || course.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          variant="ghost"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-dark-surface px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    이전
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    다음
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                      {' '}-{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, courses.length)}
                      </span>
                      {' '}/ {courses.length} 개 표시
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        className="rounded-l-md"
                      >
                        <ApperIcon name="ChevronLeft" className="w-4 h-4" />
                      </Button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          className={cn(
                            "rounded-none",
                            currentPage === i + 1 && "bg-primary-600 text-white border-primary-600"
                          )}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        className="rounded-r-md"
                      >
                        <ApperIcon name="ChevronRight" className="w-4 h-4" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-dark-surface shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? '강의 수정' : '새 강의 추가'}
                  </h2>
                  <Button
                    onClick={() => setIsDrawerOpen(false)}
                    variant="ghost"
                    className="p-2"
                  >
                    <ApperIcon name="X" className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    label="강의 제목"
                    required
                  >
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="강의 제목을 입력하세요"
                      required
                    />
                  </FormField>

                  <FormField
                    label="카테고리 (slug)"
                    required
                  >
                    <select
                      value={formData.category_slug}
                      onChange={(e) => handleInputChange('category_slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="strength">강점 찾기</option>
                      <option value="concept">콘셉트 설계</option>
                      <option value="writing">글 시나리오</option>
                      <option value="monetization">수익화 실행</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Adilo Video ID"
                    required
                  >
                    <Input
                      type="text"
                      value={formData.video_id}
                      onChange={(e) => handleInputChange('video_id', e.target.value)}
                      placeholder="Adilo 비디오 ID를 입력하세요"
                      required
                    />
                  </FormField>

                  <FormField
                    label="난이도"
                    required
                  >
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="beginner">초급</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">고급</option>
                    </select>
                  </FormField>

                  <FormField
                    label="설명"
                  >
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="강의 설명을 입력하세요"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    />
                  </FormField>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={formLoading}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 btn-primary text-white"
                      disabled={formLoading}
                    >
                      {formLoading ? (
                        <>
                          <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        isEditing ? '수정' : '생성'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCourses;