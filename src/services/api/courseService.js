import { toast } from 'react-toastify';

export const courseService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "category" } },
          { field: { Name: "requiredRole" } },
          { field: { Name: "duration" } },
          { field: { Name: "level" } },
          { field: { Name: "thumbnail" } },
          { field: { Name: "instructor" } },
          { field: { Name: "rating" } },
          { field: { Name: "studentsCount" } },
          { field: { Name: "videos" } },
          { field: { Name: "Tags" } },
          { field: { Name: "difficulty" } },
          { field: { Name: "status" } }
        ]
      };

      const response = await apperClient.fetchRecords('course', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching courses:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("강의를 불러오는 중 오류가 발생했습니다.");
      }
      return [];
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "category" } },
          { field: { Name: "requiredRole" } },
          { field: { Name: "duration" } },
          { field: { Name: "level" } },
          { field: { Name: "thumbnail" } },
          { field: { Name: "instructor" } },
          { field: { Name: "rating" } },
          { field: { Name: "studentsCount" } },
          { field: { Name: "videos" } },
          { field: { Name: "Tags" } },
          { field: { Name: "difficulty" } },
          { field: { Name: "status" } }
        ]
      };

      const response = await apperClient.getRecordById('course', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching course with ID ${id}:`, error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("강의를 찾을 수 없습니다.");
      }
      return null;
    }
  },

  async getByCategory(category) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "category" } },
          { field: { Name: "requiredRole" } },
          { field: { Name: "duration" } },
          { field: { Name: "level" } },
          { field: { Name: "thumbnail" } },
          { field: { Name: "instructor" } },
          { field: { Name: "rating" } },
          { field: { Name: "studentsCount" } },
          { field: { Name: "videos" } },
          { field: { Name: "Tags" } },
          { field: { Name: "difficulty" } },
          { field: { Name: "status" } }
        ],
        where: [
          {
            FieldName: "category",
            Operator: "EqualTo",
            Values: [category]
          }
        ]
      };

      const response = await apperClient.fetchRecords('course', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching courses by category:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("카테고리별 강의를 불러오는 중 오류가 발생했습니다.");
      }
      return [];
    }
  },

  async getRecommended(userRole = "Free_User") {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const roleHierarchy = { "Free_User": 0, "Premium": 1, "Master": 2 };
      const userLevel = roleHierarchy[userRole] || 0;
      
      // Get appropriate courses based on user role
      const allowedRoles = Object.keys(roleHierarchy).filter(
        role => roleHierarchy[role] <= userLevel
      );

      const params = {
fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "category" } },
          { field: { Name: "requiredRole" } },
          { field: { Name: "duration" } },
          { field: { Name: "level" } },
          { field: { Name: "thumbnail" } },
          { field: { Name: "instructor" } },
          { field: { Name: "rating" } },
          { field: { Name: "studentsCount" } },
          { field: { Name: "videos" } },
          { field: { Name: "Tags" } },
          { field: { Name: "difficulty" } },
          { field: { Name: "status" } }
        ],
        where: [
          {
            FieldName: "requiredRole",
            Operator: "ExactMatch",
            Values: allowedRoles
          }
        ],
        orderBy: [
          {
            fieldName: "rating",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 6,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('course', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching recommended courses:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("추천 강의를 불러오는 중 오류가 발생했습니다.");
      }
      return [];
    }
  },

  async enrollInCourse(courseId, userId) {
    try {
      // This would typically create an enrollment record
      // For now, just return success response
      await new Promise(resolve => setTimeout(resolve, 250));
      
      return {
        success: true,
        message: "강의 등록이 완료되었습니다.",
        enrollmentId: Date.now()
      };
    } catch (error) {
      console.error("Error enrolling in course:", error.message);
      toast.error("강의 등록 중 오류가 발생했습니다.");
      return {
        success: false,
        message: error.message
      };
    }
  },

  async trackVideoProgress(courseId, videoId, progress) {
    try {
      // This would typically update a progress tracking table
      // For now, simulate the operation
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const progressData = {
        courseId: parseInt(courseId),
        videoId,
        progress: Math.round(progress),
        timestamp: new Date().toISOString(),
        completed: progress >= 75
      };
      
      console.log('Video progress tracked:', progressData);
      
      return {
        success: true,
        data: progressData,
        message: progress >= 75 ? "영상 학습이 완료되었습니다!" : "진도가 저장되었습니다."
      };
    } catch (error) {
      console.error("Error tracking video progress:", error.message);
      toast.error("진도 저장 중 오류가 발생했습니다.");
      return {
        success: false,
        message: error.message
      };
    }
  },

  async getVideoProgress(courseId, videoId) {
    try {
      // This would typically fetch from a progress tracking table
      // For now, return mock data
      await new Promise(resolve => setTimeout(resolve, 150));
      
      return {
        courseId: parseInt(courseId),
        videoId,
        progress: 0,
        completed: false,
        lastWatched: null
      };
    } catch (error) {
      console.error("Error getting video progress:", error.message);
      return {
        courseId: parseInt(courseId),
        videoId,
        progress: 0,
        completed: false,
        lastWatched: null
      };
    }
  }
};