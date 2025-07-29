import { toast } from "react-toastify";

export const responsiveSettingService = {
  async getSettings() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "breakpoint_md" } },
          { field: { Name: "navbar_mobile" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ]
      };

      const response = await apperClient.fetchRecords('responsive_setting', params);
      
      if (!response.success) {
        console.error(response.message);
        // Return default settings on error
        return {
          breakpoint_md: 840,
          navbar_mobile: "hamburger"
        };
      }

      if (response.data && response.data.length > 0) {
        const setting = response.data[0];
        return {
          id: setting.Id,
          breakpoint_md: setting.breakpoint_md || 840,
          navbar_mobile: setting.navbar_mobile || "hamburger"
        };
      }

      // Create default settings if none exist
      return await this.createDefaultSettings();
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching responsive settings:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      // Return default settings on error
      return {
        breakpoint_md: 840,
        navbar_mobile: "hamburger"
      };
    }
  },

  async createDefaultSettings() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const params = {
        records: [{
          Name: "Default Responsive Settings",
          breakpoint_md: 840,
          navbar_mobile: "hamburger",
          Tags: "",
          Owner: null
        }]
      };

      const response = await apperClient.createRecord('responsive_setting', params);
      
      if (!response.success) {
        console.error(response.message);
        return {
          breakpoint_md: 840,
          navbar_mobile: "hamburger"
        };
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create responsive settings ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          const created = successfulRecords[0].data;
          return {
            id: created.Id,
            breakpoint_md: created.breakpoint_md || 840,
            navbar_mobile: created.navbar_mobile || "hamburger"
          };
        }
      }

      return {
        breakpoint_md: 840,
        navbar_mobile: "hamburger"
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating default responsive settings:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return {
        breakpoint_md: 840,
        navbar_mobile: "hamburger"
      };
    }
  },

  async updateSettings(settingsData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Get current settings to get the ID
      const currentSettings = await this.getSettings();
      
      if (!currentSettings.id) {
        // Create new settings if none exist
        return await this.createDefaultSettings();
      }

      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(currentSettings.id),
          ...(settingsData.breakpoint_md !== undefined && { breakpoint_md: parseInt(settingsData.breakpoint_md) }),
          ...(settingsData.navbar_mobile !== undefined && { navbar_mobile: settingsData.navbar_mobile }),
          ...(settingsData.Name !== undefined && { Name: settingsData.Name }),
          ...(settingsData.Tags !== undefined && { Tags: settingsData.Tags }),
          ...(settingsData.Owner !== undefined && { Owner: parseInt(settingsData.Owner) || null })
        }]
      };

      const response = await apperClient.updateRecord('responsive_setting', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update responsive settings ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success("반응형 설정이 성공적으로 업데이트되었습니다!");
          const updated = successfulUpdates[0].data;
          return {
            id: updated.Id,
            breakpoint_md: updated.breakpoint_md || 840,
            navbar_mobile: updated.navbar_mobile || "hamburger"
          };
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating responsive settings:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("반응형 설정 업데이트 중 오류가 발생했습니다.");
      }
      return null;
    }
  },

  async deleteSettings(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('responsive_setting', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete responsive settings ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success("반응형 설정이 성공적으로 삭제되었습니다!");
          return true;
        }
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting responsive settings:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("반응형 설정 삭제 중 오류가 발생했습니다.");
      }
      return false;
    }
  },

  // Helper method to apply responsive settings to CSS
  applyResponsiveSettings(settings) {
    try {
      const root = document.documentElement;
      
      // Apply breakpoint_md as CSS custom property
      if (settings.breakpoint_md) {
        root.style.setProperty('--breakpoint-md', `${settings.breakpoint_md}px`);
      }
      
      // Store navbar_mobile setting for components to use
      if (settings.navbar_mobile) {
        root.setAttribute('data-navbar-mobile', settings.navbar_mobile);
      }
      
      return true;
    } catch (error) {
      console.error("Error applying responsive settings:", error.message);
      return false;
    }
  }
};