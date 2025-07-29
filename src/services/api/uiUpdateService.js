import { toast } from 'react-toastify';

export const uiUpdateService = {
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
          { field: { Name: "nextButtonText" } },
          { field: { Name: "course" } }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('uiupdate', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching UI updates:", error?.response?.data?.message);
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
          { field: { Name: "nextButtonText" } },
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

      const response = await apperClient.fetchRecords('uiupdate', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching UI updates for course ${courseId}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async getNextButtonText(courseId) {
    try {
      const uiUpdate = await this.getByCourseId(courseId);
      return uiUpdate?.nextButtonText || "다음 수업";
    } catch (error) {
      console.error("Error getting next button text:", error.message);
      return "다음 수업";
    }
  },

  async create(uiData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: uiData.Name,
          nextButtonText: uiData.nextButtonText || "다음 수업",
          course: parseInt(uiData.course)
        }]
      };

      const response = await apperClient.createRecord('uiupdate', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create UI update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success("UI 설정이 생성되었습니다!");
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating UI update:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async update(uiId, uiData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(uiId),
          Name: uiData.Name,
          nextButtonText: uiData.nextButtonText,
          course: parseInt(uiData.course)
        }]
      };

      const response = await apperClient.updateRecord('uiupdate', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update UI settings ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success("UI 설정이 업데이트되었습니다!");
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating UI settings:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async delete(uiId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(uiId)]
      };

      const response = await apperClient.deleteRecord('uiupdate', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete UI settings ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }

      toast.success("UI 설정이 삭제되었습니다!");
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting UI settings:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }
};