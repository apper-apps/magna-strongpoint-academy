import { toast } from "react-toastify";

export const themeToggleService = {
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
          { field: { Name: "enable_dark_mode" } },
          { field: { Name: "persist_in_local_storage" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ]
      };

      const response = await apperClient.fetchRecords('theme_toggle', params);
      
      if (!response.success) {
        console.error(response.message);
        // Return default settings on error
        return {
          enable_dark_mode: true,
          persist_in_local_storage: true
        };
      }

      if (response.data && response.data.length > 0) {
        const setting = response.data[0];
        return {
          id: setting.Id,
          enable_dark_mode: setting.enable_dark_mode !== undefined ? setting.enable_dark_mode : true,
          persist_in_local_storage: setting.persist_in_local_storage !== undefined ? setting.persist_in_local_storage : true
        };
      }

      // Create default settings if none exist
      return await this.createDefaultSettings();
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching theme toggle settings:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      // Return default settings on error
      return {
        enable_dark_mode: true,
        persist_in_local_storage: true
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
          Name: "Default Theme Settings",
          enable_dark_mode: true,
          persist_in_local_storage: true,
          Tags: "",
          Owner: null
        }]
      };

      const response = await apperClient.createRecord('theme_toggle', params);
      
      if (!response.success) {
        console.error(response.message);
        return {
          enable_dark_mode: true,
          persist_in_local_storage: true
        };
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create theme toggle settings ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            enable_dark_mode: created.enable_dark_mode !== undefined ? created.enable_dark_mode : true,
            persist_in_local_storage: created.persist_in_local_storage !== undefined ? created.persist_in_local_storage : true
          };
        }
      }

      return {
        enable_dark_mode: true,
        persist_in_local_storage: true
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating default theme toggle settings:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return {
        enable_dark_mode: true,
        persist_in_local_storage: true
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
          ...(settingsData.enable_dark_mode !== undefined && { enable_dark_mode: settingsData.enable_dark_mode }),
          ...(settingsData.persist_in_local_storage !== undefined && { persist_in_local_storage: settingsData.persist_in_local_storage }),
          ...(settingsData.Name !== undefined && { Name: settingsData.Name }),
          ...(settingsData.Tags !== undefined && { Tags: settingsData.Tags }),
          ...(settingsData.Owner !== undefined && { Owner: parseInt(settingsData.Owner) || null })
        }]
      };

      const response = await apperClient.updateRecord('theme_toggle', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update theme toggle settings ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          const updated = successfulUpdates[0].data;
          return {
            id: updated.Id,
            enable_dark_mode: updated.enable_dark_mode !== undefined ? updated.enable_dark_mode : true,
            persist_in_local_storage: updated.persist_in_local_storage !== undefined ? updated.persist_in_local_storage : true
          };
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating theme toggle settings:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("테마 설정 업데이트 중 오류가 발생했습니다.");
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

      const response = await apperClient.deleteRecord('theme_toggle', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete theme toggle settings ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success("테마 설정이 성공적으로 삭제되었습니다!");
          return true;
        }
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting theme toggle settings:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("테마 설정 삭제 중 오류가 발생했습니다.");
      }
      return false;
    }
  },

  // Helper method to get theme preference from various sources
  async getThemePreference() {
    try {
      const settings = await this.getSettings();
      
      if (!settings.enable_dark_mode) {
        return false; // Dark mode disabled
      }

      if (settings.persist_in_local_storage) {
        const stored = localStorage.getItem('dark-mode');
        if (stored !== null) {
          return JSON.parse(stored);
        }
      }

      // Fallback to system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (error) {
      console.error("Error getting theme preference:", error.message);
      // Fallback to system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  },

  // Helper method to save theme preference
  async saveThemePreference(isDark) {
    try {
      const settings = await this.getSettings();
      
      if (settings.persist_in_local_storage) {
        localStorage.setItem('dark-mode', JSON.stringify(isDark));
      }
      
      return true;
    } catch (error) {
      console.error("Error saving theme preference:", error.message);
      return false;
    }
  }
};