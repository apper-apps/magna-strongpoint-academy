import { toast } from "react-toastify";
import React from "react";

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
          { field: { Name: "difficulty" } },
          { field: { Name: "status" } }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
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
        console.error("Error fetching courses:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getById(courseId) {
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
          { field: { Name: "difficulty" } },
          { field: { Name: "status" } }
        ]
      };

      const response = await apperClient.getRecordById('course', courseId, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching course ${courseId}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async trackVideoProgress(courseId, videoId, progress) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Update course progress
      const params = {
        records: [{
          Id: parseInt(courseId),
          progress: `${videoId}:${progress}`
        }]
      };

      const response = await apperClient.updateRecord('course', params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }

      if (response.results) {
        const failedUpdates = response.results.filter(result => !result.success);
        if (failedUpdates.length > 0) {
          console.error(`Failed to track progress for ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        }
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error tracking video progress:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  },

  async getNextLesson(courseId, currentVideoId) {
    try {
      const course = await this.getById(courseId);
      if (!course || !course.videos) return null;

      // Parse videos JSON string
      const videos = JSON.parse(course.videos);
      const currentIndex = videos.findIndex(video => video.id === currentVideoId);
      
      if (currentIndex >= 0 && currentIndex < videos.length - 1) {
        return videos[currentIndex + 1];
      }
      
      return null;
    } catch (error) {
      console.error("Error getting next lesson:", error.message);
      return null;
    }
  },

  async enrollCourse(courseId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(courseId),
          status: "in_progress"
        }]
      };

      const response = await apperClient.updateRecord('course', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const failedUpdates = response.results.filter(result => !result.success);
        if (failedUpdates.length > 0) {
          console.error(`Failed to enroll in course ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          return false;
        }
      }

      toast.success("강의 등록이 완료되었습니다!");
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error enrolling in course:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
}
};