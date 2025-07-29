import mockUsers from "@/services/mockData/users.json";

let users = [...mockUsers];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  async getAll() {
    await delay(300);
    return [...users];
  },

  async getById(id) {
    await delay(200);
    const user = users.find(u => u.Id === parseInt(id));
    if (!user) throw new Error("사용자를 찾을 수 없습니다.");
    return { ...user };
  },

async getCurrentUser() {
    await delay(400);
    return {
      Id: 1,
      name: "김강점",
      email: "user@strongpoint.com",
      role: "Free_User",
      joinedAt: "2024-01-15T00:00:00.000Z",
      progress: {
        completedSteps: 2,
        totalSteps: 4,
        coursesCompleted: 3,
        totalCourses: 12,
        communityPosts: 5,
        streak: 15
      },
      avatar: "/api/placeholder/64/64",
      subscription: {
        plan: "free",
        status: "active",
        startDate: "2024-01-15T00:00:00.000Z",
        endDate: null,
        autoRenew: false
      }
    };
  },

  async updateProfile(id, data) {
    await delay(300);
    const index = users.findIndex(u => u.Id === parseInt(id));
    if (index === -1) throw new Error("사용자를 찾을 수 없습니다.");
    
    users[index] = { ...users[index], ...data };
    return { ...users[index] };
  },

  async upgradeMembership(userId, plan) {
    await delay(500);
    const roleMap = {
      premium: "Premium",
      master: "Master"
    };
    
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
  },

  async cancelSubscription(userId) {
    await delay(300);
    return {
      success: true,
      message: "구독이 취소되었습니다. 현재 기간이 만료되면 무료 플랜으로 변경됩니다."
    };
  }
};