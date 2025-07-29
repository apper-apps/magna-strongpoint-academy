import { toast } from 'react-toastify';

export const communityService = {
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
          { field: { Name: "authorName" } },
          { field: { Name: "authorRole" } },
          { field: { Name: "title" } },
          { field: { Name: "content" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "likes" } },
          { field: { Name: "comments" } },
          { field: { Name: "views" } },
          { field: { Name: "Tags" } },
          { field: { Name: "authorId" } }
        ],
        orderBy: [
          {
            fieldName: "createdAt",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('community_post', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching community posts:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("게시글을 불러오는 중 오류가 발생했습니다.");
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
          { field: { Name: "authorName" } },
          { field: { Name: "authorRole" } },
          { field: { Name: "title" } },
          { field: { Name: "content" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "likes" } },
          { field: { Name: "comments" } },
          { field: { Name: "views" } },
          { field: { Name: "Tags" } },
          { field: { Name: "authorId" } }
        ]
      };

      const response = await apperClient.getRecordById('community_post', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching post with ID ${id}:`, error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("게시글을 찾을 수 없습니다.");
      }
      return null;
    }
  },

  async create(postData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const params = {
        records: [{
          Name: postData.Name || postData.title || "",
          authorName: postData.authorName || "",
          authorRole: postData.authorRole || "Free_User",
          title: postData.title || "",
          content: postData.content || "",
          createdAt: postData.createdAt || new Date().toISOString(),
          likes: 0,
          comments: 0,
          views: 0,
          Tags: Array.isArray(postData.tags) ? postData.tags.join(",") : (postData.Tags || ""),
          authorId: parseInt(postData.authorId) || null
        }]
      };

      const response = await apperClient.createRecord('community_post', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create community posts ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success("게시글이 성공적으로 작성되었습니다!");
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating community post:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("게시글 작성 중 오류가 발생했습니다.");
      }
      return null;
    }
  },

  async likePost(id) {
    try {
      // First get current post data
      const currentPost = await this.getById(id);
      if (!currentPost) {
        throw new Error("게시글을 찾을 수 없습니다.");
      }

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(id),
          likes: (currentPost.likes || 0) + 1
        }]
      };

      const response = await apperClient.updateRecord('community_post', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to like post ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error liking post:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("좋아요 처리 중 오류가 발생했습니다.");
      }
      return null;
    }
  },

  async getPopular() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "authorName" } },
          { field: { Name: "authorRole" } },
          { field: { Name: "title" } },
          { field: { Name: "content" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "likes" } },
          { field: { Name: "comments" } },
          { field: { Name: "views" } },
          { field: { Name: "Tags" } },
          { field: { Name: "authorId" } }
        ],
        orderBy: [
          {
            fieldName: "likes",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 5,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('community_post', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching popular posts:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("인기 게시글을 불러오는 중 오류가 발생했습니다.");
      }
      return [];
    }
  }
};