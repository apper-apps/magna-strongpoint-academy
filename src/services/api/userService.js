import { toast } from "react-toastify";
import React from "react";

export const userService = {
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
          { field: { Name: "email" } },
          { field: { Name: "role" } },
          { field: { Name: "joinedAt" } },
          { field: { Name: "progress" } },
          { field: { Name: "avatar" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ]
      };

      const response = await apperClient.fetchRecords('app_User', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching users:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("사용자 목록을 불러오는 중 오류가 발생했습니다.");
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
          { field: { Name: "email" } },
          { field: { Name: "role" } },
          { field: { Name: "joinedAt" } },
          { field: { Name: "progress" } },
          { field: { Name: "avatar" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ]
      };

      const response = await apperClient.getRecordById('app_User', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching user with ID ${id}:`, error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("사용자를 찾을 수 없습니다.");
      }
      return null;
    }
  },

  async getCurrentUser() {
    try {
      // This would typically get the current authenticated user
      // For now, return first user from the database
      const users = await this.getAll();
      if (users.length > 0) {
        return {
          ...users[0],
          progress: {
            completedSteps: 2,
            totalSteps: 4,
            coursesCompleted: 3,
            totalCourses: 12,
            communityPosts: 5,
            streak: 15
          },
          subscription: {
            plan: "free",
            status: "active",
            startDate: "2024-01-15T00:00:00.000Z",
            endDate: null,
            autoRenew: false
          }
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error.message);
      toast.error("현재 사용자 정보를 불러올 수 없습니다.");
      return null;
    }
  },

  async create(userData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const params = {
        records: [{
          Name: userData.Name || "",
          email: userData.email || "",
          role: userData.role || "Free_User",
          joinedAt: userData.joinedAt || new Date().toISOString(),
          progress: userData.progress || "",
          avatar: userData.avatar || "",
          Tags: userData.Tags || "",
          Owner: parseInt(userData.Owner) || null
        }]
      };

      const response = await apperClient.createRecord('app_User', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create users ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success("사용자가 성공적으로 생성되었습니다!");
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating user:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("사용자 생성 중 오류가 발생했습니다.");
      }
      return null;
    }
  },

  async updateProfile(id, data) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          ...(data.Name && { Name: data.Name }),
          ...(data.email && { email: data.email }),
          ...(data.role && { role: data.role }),
          ...(data.joinedAt && { joinedAt: data.joinedAt }),
          ...(data.progress && { progress: data.progress }),
          ...(data.avatar && { avatar: data.avatar }),
          ...(data.Tags && { Tags: data.Tags }),
          ...(data.Owner && { Owner: parseInt(data.Owner) })
        }]
      };

      const response = await apperClient.updateRecord('app_User', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update users ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success("프로필이 성공적으로 업데이트되었습니다!");
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating user profile:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("프로필 업데이트 중 오류가 발생했습니다.");
      }
      return null;
    }
  },

  async upgradeMembership(userId, plan) {
    try {
      const roleMap = {
        premium: "Premium",
        master: "Master"
      };

      const updatedUser = await this.updateProfile(userId, {
        role: roleMap[plan]
      });

      if (updatedUser) {
        return {
          success: true,
          message: "멤버십이 성공적으로 업그레이드되었습니다!",
          newRole: roleMap[plan],
          subscription: {
            plan,
            status: "active",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            autoRenew: true
          }
        };
      }

      return { success: false, message: "업그레이드에 실패했습니다." };
    } catch (error) {
      console.error("Error upgrading membership:", error.message);
      toast.error("멤버십 업그레이드 중 오류가 발생했습니다.");
      return { success: false, message: error.message };
    }
  },

  async cancelSubscription(userId) {
    try {
      // Update user role back to Free_User
      const updatedUser = await this.updateProfile(userId, {
        role: "Free_User"
      });

      if (updatedUser) {
        return {
          success: true,
          message: "구독이 취소되었습니다. 현재 기간이 만료되면 무료 플랜으로 변경됩니다."
        };
      }

      return { success: false, message: "구독 취소에 실패했습니다." };
    } catch (error) {
      console.error("Error canceling subscription:", error.message);
      toast.error("구독 취소 중 오류가 발생했습니다.");
      return { success: false, message: error.message };
}
  }
};