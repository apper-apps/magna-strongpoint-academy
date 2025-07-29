import mockCourses from "@/services/mockData/courses.json";

let courses = [...mockCourses];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const courseService = {
  async getAll() {
    await delay(400);
    return courses.map(course => ({ ...course }));
  },

  async getById(id) {
    await delay(300);
    const course = courses.find(c => c.Id === parseInt(id));
    if (!course) throw new Error("강의를 찾을 수 없습니다.");
    return { ...course };
  },

  async getByCategory(category) {
    await delay(350);
    return courses.filter(c => c.category === category).map(course => ({ ...course }));
  },

  async getRecommended(userRole = "Free_User") {
    await delay(300);
    const roleHierarchy = { "Free_User": 0, "Premium": 1, "Master": 2 };
    const userLevel = roleHierarchy[userRole] || 0;
    
    return courses
      .filter(c => roleHierarchy[c.requiredRole] <= userLevel)
      .slice(0, 6)
      .map(course => ({ ...course }));
  },

  async enrollInCourse(courseId, userId) {
    await delay(250);
    return {
      success: true,
      message: "강의 등록이 완료되었습니다.",
      enrollmentId: Date.now()
    };
  }
};