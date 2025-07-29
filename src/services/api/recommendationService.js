import { toast } from 'react-toastify';

class RecommendationService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  /**
   * Get personalized course recommendations for a user
   * Uses collaborative filtering with rule-based fallback
   */
  async getRecommendedForUser(userId, userRole = 'Free_User', maxItems = 3) {
    try {
      if (!userId) {
        // For unauthenticated users, use rule-based recommendations
        return await this.getRuleBasedRecommendations(userRole, maxItems);
      }

      // First, try to get existing recommendations for the user
      const existingRecommendations = await this.getExistingRecommendations(userId, maxItems);
      
      if (existingRecommendations.length >= maxItems) {
        return await this.enrichRecommendationsWithCourseData(existingRecommendations);
      }

      // If not enough existing recommendations, generate new ones using collaborative filtering
      const newRecommendations = await this.generateCollaborativeRecommendations(userId, userRole, maxItems);
      
      if (newRecommendations.length > 0) {
        // Store new recommendations in the database
        await this.storeRecommendations(userId, newRecommendations);
        return await this.enrichRecommendationsWithCourseData(newRecommendations.slice(0, maxItems));
      }

      // Fallback to rule-based recommendations
      return await this.getRuleBasedRecommendations(userRole, maxItems);

    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error getting recommendations:", error?.response?.data?.message);
      } else {
        console.error("Error getting recommendations:", error.message);
      }
      
      // Fallback to rule-based recommendations on any error
      return await this.getRuleBasedRecommendations(userRole, maxItems);
    }
  }

  /**
   * Get existing recommendations from the database
   */
  async getExistingRecommendations(userId, maxItems) {
    try {
      const params = {
        fields: [
          { field: { Name: "course" } },
          { field: { Name: "recommendationReason" } },
          { field: { Name: "recommendationScore" } }
        ],
        where: [
          {
            FieldName: "user",
            Operator: "EqualTo",
            Values: [parseInt(userId)]
          }
        ],
        orderBy: [
          {
            fieldName: "recommendationScore",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: maxItems,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('recommendedCourse', params);
      
      if (!response.success) {
        console.error("Failed to fetch existing recommendations:", response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching existing recommendations:", error.message);
      return [];
    }
  }

  /**
   * Generate recommendations using collaborative filtering
   */
  async generateCollaborativeRecommendations(userId, userRole, maxItems) {
    try {
      // Get similar users based on role and course completion patterns
      const similarUsers = await this.findSimilarUsers(userId, userRole);
      
      if (similarUsers.length === 0) {
        return [];
      }

      // Get courses that similar users have completed or rated highly
      const collaborativeRecommendations = await this.getCoursesByUserSimilarity(similarUsers, userId, maxItems);
      
      return collaborativeRecommendations;
    } catch (error) {
      console.error("Error in collaborative filtering:", error.message);
      return [];
    }
  }

  /**
   * Find users similar to the current user
   */
  async findSimilarUsers(userId, userRole) {
    try {
      // Find users with the same or higher role
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "role" } },
          { field: { Name: "progress" } }
        ],
        where: [
          {
            FieldName: "role",
            Operator: "ExactMatch",
            Values: [userRole, "Premium", "Master"]
          }
        ],
        whereGroups: [
          {
            operator: "AND",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "Id",
                    operator: "NotEqualTo",
                    values: [parseInt(userId)]
                  }
                ],
                operator: "AND"
              }
            ]
          }
        ],
        pagingInfo: {
          limit: 20,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('app_User', params);
      
      if (!response.success) {
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error finding similar users:", error.message);
      return [];
    }
  }

  /**
   * Get course recommendations based on similar users' preferences
   */
  async getCoursesByUserSimilarity(similarUsers, currentUserId, maxItems) {
    try {
      const userIds = similarUsers.map(user => user.Id);
      
      // Get existing recommendations from similar users to find popular courses
      const params = {
        fields: [
          { field: { Name: "course" } },
          { field: { Name: "recommendationScore" } }
        ],
        where: [
          {
            FieldName: "user",
            Operator: "ExactMatch",
            Values: userIds
          }
        ],
        orderBy: [
          {
            fieldName: "recommendationScore",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: maxItems * 2, // Get more to filter duplicates
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('recommendedCourse', params);
      
      if (!response.success) {
        return [];
      }

      const recommendations = response.data || [];
      
      // Convert to recommendation format with enhanced scores
      return recommendations.slice(0, maxItems).map(rec => ({
        courseId: rec.course?.Id || rec.course,
        reason: "비슷한 사용자들이 선택한 강좌",
        score: (rec.recommendationScore || 0) + 0.2 // Boost collaborative scores slightly
      }));

    } catch (error) {
      console.error("Error getting courses by similarity:", error.message);
      return [];
    }
  }

  /**
   * Rule-based fallback recommendations
   */
  async getRuleBasedRecommendations(userRole, maxItems) {
    try {
      // Define rule-based criteria based on user role
      let categoryFilter = [];
      let levelFilter = [];
      
      switch(userRole) {
        case 'Free_User':
          categoryFilter = ['강점 찾기'];
          levelFilter = ['초급'];
          break;
        case 'Premium':
          categoryFilter = ['강점 찾기', '콘셉트 설계'];
          levelFilter = ['초급', '중급'];
          break;
        case 'Master':
          categoryFilter = ['콘셉트 설계', '글 시나리오', '수익화 실행'];
          levelFilter = ['중급', '고급'];
          break;
        default:
          categoryFilter = ['강점 찾기'];
          levelFilter = ['초급'];
      }

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "title" } },
          { field: { Name: "category" } },
          { field: { Name: "level" } },
          { field: { Name: "rating" } },
          { field: { Name: "studentsCount" } },
          { field: { Name: "requiredRole" } }
        ],
        whereGroups: [
          {
            operator: "AND",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "category",
                    operator: "ExactMatch",
                    values: categoryFilter
                  }
                ],
                operator: "OR"
              },
              {
                conditions: [
                  {
                    fieldName: "level",
                    operator: "ExactMatch", 
                    values: levelFilter
                  }
                ],
                operator: "OR"
              },
              {
                conditions: [
                  {
                    fieldName: "requiredRole",
                    operator: "ExactMatch",
                    values: [userRole]
                  }
                ],
                operator: "AND"
              }
            ]
          }
        ],
        orderBy: [
          {
            fieldName: "rating",
            sorttype: "DESC"
          },
          {
            fieldName: "studentsCount", 
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: maxItems,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('course', params);
      
      if (!response.success) {
        console.error("Failed to fetch rule-based recommendations:", response.message);
        return [];
      }

      // Convert courses to recommendation format
      const courses = response.data || [];
      return courses.map(course => ({
        ...course,
        recommendationReason: `${userRole} 회원님께 추천하는 ${course.category} 강좌`,
        recommendationScore: this.calculateRuleBasedScore(course, userRole)
      }));

    } catch (error) {
      console.error("Error getting rule-based recommendations:", error.message);
      return [];
    }
  }

  /**
   * Calculate recommendation score for rule-based recommendations
   */
  calculateRuleBasedScore(course, userRole) {
    let score = 0;
    
    // Base score from rating
    score += (course.rating || 0) * 0.3;
    
    // Popularity score
    const studentCount = course.studentsCount || 0;
    score += Math.min(studentCount / 100, 2.0); // Max 2.0 points for popularity
    
    // Role match bonus
    if (course.requiredRole === userRole) {
      score += 1.0;
    }
    
    // Category preference (could be enhanced with user preferences)
    score += 0.5;
    
    return Math.round(score * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Enrich recommendation data with full course information
   */
  async enrichRecommendationsWithCourseData(recommendations) {
    try {
      if (!recommendations || recommendations.length === 0) {
        return [];
      }

      const courseIds = recommendations.map(rec => {
        const courseId = rec.course?.Id || rec.courseId || rec.Id;
        return parseInt(courseId);
      }).filter(id => !isNaN(id));

      if (courseIds.length === 0) {
        return [];
      }

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "category" } },
          { field: { Name: "level" } },
          { field: { Name: "duration" } },
          { field: { Name: "thumbnail" } },
          { field: { Name: "instructor" } },
          { field: { Name: "rating" } },
          { field: { Name: "studentsCount" } },
          { field: { Name: "requiredRole" } }
        ],
        where: [
          {
            FieldName: "Id",
            Operator: "ExactMatch",
            Values: courseIds
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('course', params);
      
      if (!response.success) {
        console.error("Failed to enrich recommendations:", response.message);
        return recommendations;
      }

      const courses = response.data || [];
      
      // Merge recommendation data with course data
      return recommendations.map(rec => {
        const courseId = rec.course?.Id || rec.courseId || rec.Id;
        const course = courses.find(c => c.Id === parseInt(courseId));
        
        if (course) {
          return {
            ...course,
            recommendationReason: rec.recommendationReason || rec.reason || "추천 강좌",
            recommendationScore: rec.recommendationScore || rec.score || 0
          };
        }
        
        return rec;
      }).filter(rec => rec.title); // Only return items that have course data
      
    } catch (error) {
      console.error("Error enriching recommendations:", error.message);
      return recommendations;
    }
  }

  /**
   * Store new recommendations in the database
   */
  async storeRecommendations(userId, recommendations) {
    try {
      if (!recommendations || recommendations.length === 0) {
        return;
      }

      const records = recommendations.map(rec => ({
        user: parseInt(userId),
        course: parseInt(rec.courseId || rec.Id),
        recommendationReason: rec.reason || rec.recommendationReason || "시스템 추천",
        recommendationScore: rec.score || rec.recommendationScore || 0
      }));

      const params = {
        records: records
      };

      const response = await this.apperClient.createRecord('recommendedCourse', params);
      
      if (!response.success) {
        console.error("Failed to store recommendations:", response.message);
        return;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to store ${failedRecords.length} recommendation records:${JSON.stringify(failedRecords)}`);
        }
      }

    } catch (error) {
      console.error("Error storing recommendations:", error.message);
    }
  }

  /**
   * Update recommendation score based on user interaction
   */
  async updateRecommendationScore(userId, courseId, interactionType = 'view') {
    try {
      // Find existing recommendation
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "recommendationScore" } }
        ],
        whereGroups: [
          {
            operator: "AND",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "user",
                    operator: "EqualTo",
                    values: [parseInt(userId)]
                  }
                ],
                operator: "AND"
              },
              {
                conditions: [
                  {
                    fieldName: "course",
                    operator: "EqualTo",
                    values: [parseInt(courseId)]
                  }
                ],
                operator: "AND"
              }
            ]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('recommendedCourse', params);
      
      if (!response.success || !response.data || response.data.length === 0) {
        return;
      }

      const recommendation = response.data[0];
      let scoreIncrease = 0;
      
      switch(interactionType) {
        case 'view':
          scoreIncrease = 0.1;
          break;
        case 'enroll':
          scoreIncrease = 1.0;
          break;
        case 'complete':
          scoreIncrease = 2.0;
          break;
        default:
          scoreIncrease = 0.1;
      }

      const newScore = (recommendation.recommendationScore || 0) + scoreIncrease;
      
      const updateParams = {
        records: [
          {
            Id: recommendation.Id,
            recommendationScore: Math.round(newScore * 10) / 10
          }
        ]
      };

      await this.apperClient.updateRecord('recommendedCourse', updateParams);

    } catch (error) {
      console.error("Error updating recommendation score:", error.message);
    }
  }
}

// Create and export service instance
export const recommendationService = new RecommendationService();