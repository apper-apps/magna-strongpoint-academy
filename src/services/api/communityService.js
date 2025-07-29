import mockPosts from "@/services/mockData/communityPosts.json";

let posts = [...mockPosts];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const communityService = {
  async getAll() {
    await delay(350);
    return posts.map(post => ({ ...post })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    await delay(200);
    const post = posts.find(p => p.Id === parseInt(id));
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");
    return { ...post };
  },

  async create(postData) {
    await delay(300);
    const newPost = {
      Id: Math.max(...posts.map(p => p.Id)) + 1,
      ...postData,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      views: 0
    };
    posts.unshift(newPost);
    return { ...newPost };
  },

  async likePost(id) {
    await delay(200);
    const post = posts.find(p => p.Id === parseInt(id));
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");
    
    post.likes += 1;
    return { ...post };
  },

  async getPopular() {
    await delay(300);
    return posts
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5)
      .map(post => ({ ...post }));
  }
};