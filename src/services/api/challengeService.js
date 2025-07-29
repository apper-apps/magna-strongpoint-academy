import { toast } from 'react-toastify';

export const challengeService = {
  async getCurrentChallenge() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "month" } },
          { field: { Name: "goal" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ],
        where: [
          {
            FieldName: "month",
            Operator: "EqualTo",
            Values: [currentMonth]
          }
        ],
        pagingInfo: {
          limit: 1,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('challenges', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      // If no challenge exists for current month, create one
      if (!response.data || response.data.length === 0) {
        return await this.createMonthlyChallenge(currentMonth);
      }

      return response.data[0];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching current challenge:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("현재 챌린지를 불러오는 중 오류가 발생했습니다.");
      }
      return null;
    }
  },

  async createMonthlyChallenge(month) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const monthNames = {
        '01': '1월', '02': '2월', '03': '3월', '04': '4월',
        '05': '5월', '06': '6월', '07': '7월', '08': '8월',
        '09': '9월', '10': '10월', '11': '11월', '12': '12월'
      };

      const year = month.split('-')[0];
      const monthNum = month.split('-')[1];
      const challengeName = `${year}년 ${monthNames[monthNum]} 챌린지`;

      const params = {
        records: [{
          Name: challengeName,
          month: month,
          goal: 4, // 4 videos as specified in requirements
          Tags: "monthly,video-challenge"
        }]
      };

      const response = await apperClient.createRecord('challenges', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const successfulRecords = response.results.filter(result => result.success);
        
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating monthly challenge:", error.message);
      return null;
    }
  },

  async getUserParticipation(challengeId, userId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "userId" } },
          { field: { Name: "challengeId" } },
          { field: { Name: "completed" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ],
        where: [
          {
            FieldName: "userId",
            Operator: "EqualTo",
            Values: [parseInt(userId)]
          },
          {
            FieldName: "challengeId",
            Operator: "EqualTo",
            Values: [parseInt(challengeId)]
          }
        ],
        pagingInfo: {
          limit: 1,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('participations', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (!response.data || response.data.length === 0) {
        // Create new participation record
        return await this.createParticipation(challengeId, userId);
      }

      // Add progress field from tags or calculate from completed status
      const participation = response.data[0];
      const progress = participation.completed ? 4 : this.parseProgressFromTags(participation.Tags);
      
      return {
        ...participation,
        progress: progress
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching user participation:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async createParticipation(challengeId, userId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: `Participation-${challengeId}-${userId}`,
          userId: parseInt(userId),
          challengeId: parseInt(challengeId),
          completed: false,
          Tags: "progress:0"
        }]
      };

      const response = await apperClient.createRecord('participations', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const successfulRecords = response.results.filter(result => result.success);
        
        if (successfulRecords.length > 0) {
          const participation = successfulRecords[0].data;
          return {
            ...participation,
            progress: 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating participation:", error.message);
      return null;
    }
  },

  async updateProgress(participationId, newProgress) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const isCompleted = newProgress >= 4;

      const params = {
        records: [{
          Id: parseInt(participationId),
          completed: isCompleted,
          Tags: `progress:${newProgress}`
        }]
      };

      const response = await apperClient.updateRecord('participations', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const successfulUpdates = response.results.filter(result => result.success);
        
        if (successfulUpdates.length > 0) {
          const updated = successfulUpdates[0].data;
          
          if (isCompleted) {
            toast.success("🎉 월간 챌린지를 완료했습니다!");
          } else {
            toast.success(`진도가 업데이트되었습니다: ${newProgress}/4 영상`);
          }
          
          return {
            ...updated,
            progress: newProgress
          };
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating progress:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("진도 업데이트 중 오류가 발생했습니다.");
      }
      return null;
    }
  },

  async getLeaderboard(challengeId, limit = 10) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_Key
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "userId" } },
          { field: { Name: "challengeId" } },
          { field: { Name: "completed" } },
          { field: { Name: "Tags" } }
        ],
        where: [
          {
            FieldName: "challengeId",
            Operator: "EqualTo",
            Values: [parseInt(challengeId)]
          }
        ],
        orderBy: [
          {
            fieldName: "completed",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('participations', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      const participations = response.data || [];
      
      // Enhance with user data and calculate progress
      const leaderboard = await Promise.all(
        participations.map(async (participation, index) => {
          const progress = participation.completed ? 4 : this.parseProgressFromTags(participation.Tags);
          
          // Get user data for display
          let userData = { Name: "사용자", role: "Free_User" };
          try {
            if (participation.userId && participation.userId.Id) {
              // If userId is lookup object, use the display name
              userData = {
                Name: participation.userId.Name || "사용자",
                role: "Free_User" // Default role, would need separate lookup for actual role
              };
            }
          } catch (error) {
            console.log("Could not fetch user data for leaderboard");
          }

          return {
            rank: index + 1,
            userId: participation.userId,
            userName: userData.Name,
            userRole: userData.role,
            progress: progress,
            completed: participation.completed,
            participationId: participation.Id
          };
        })
      );

      // Sort by progress (completed first, then by progress count)
      leaderboard.sort((a, b) => {
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        return b.progress - a.progress;
      });

      // Reassign ranks after sorting
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return leaderboard;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching leaderboard:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  parseProgressFromTags(tags) {
    if (!tags) return 0;
    const progressMatch = tags.match(/progress:(\d+)/);
    return progressMatch ? parseInt(progressMatch[1]) : 0;
  },

  async incrementUserProgress(userId, challengeId) {
    try {
      const participation = await this.getUserParticipation(challengeId, userId);
      if (!participation) return null;

      const currentProgress = participation.progress || 0;
      const newProgress = Math.min(currentProgress + 1, 4); // Cap at 4 videos

      return await this.updateProgress(participation.Id, newProgress);
    } catch (error) {
      console.error("Error incrementing user progress:", error.message);
      return null;
    }
  }
};