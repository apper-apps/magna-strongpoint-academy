import { toast } from 'react-toastify';

export const courseSeriesService = {
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
          { field: { Name: "autoPlayNext" } },
          { field: { Name: "showSeriesProgress" } },
          { field: { Name: "course" } }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('courseseries', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching course series:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getByCourseId(courseId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "autoPlayNext" } },
          { field: { Name: "showSeriesProgress" } },
          { field: { Name: "course" } }
        ],
        where: [
          {
            FieldName: "course",
            Operator: "EqualTo",
            Values: [parseInt(courseId)]
          }
        ]
      };

      const response = await apperClient.fetchRecords('courseseries', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching course series for course ${courseId}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async create(seriesData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: seriesData.Name,
          autoPlayNext: seriesData.autoPlayNext || false,
          showSeriesProgress: seriesData.showSeriesProgress || false,
          course: parseInt(seriesData.course)
        }]
      };

      const response = await apperClient.createRecord('courseseries', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create course series ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success("코스 시리즈가 생성되었습니다!");
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating course series:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async update(seriesId, seriesData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(seriesId),
          Name: seriesData.Name,
          autoPlayNext: seriesData.autoPlayNext,
          showSeriesProgress: seriesData.showSeriesProgress,
          course: parseInt(seriesData.course)
        }]
      };

      const response = await apperClient.updateRecord('courseseries', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update course series ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success("코스 시리즈가 업데이트되었습니다!");
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating course series:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async delete(seriesId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(seriesId)]
      };

      const response = await apperClient.deleteRecord('courseseries', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete course series ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }

      toast.success("코스 시리즈가 삭제되었습니다!");
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting course series:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }
};