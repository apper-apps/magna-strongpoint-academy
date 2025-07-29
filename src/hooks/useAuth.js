import { useState, useEffect } from "react";

export const useAuth = () => {
const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    const mockUser = {
      id: "1",
      name: "김강점",
      email: "user@example.com",
      role: "Free_User",
      joinedAt: new Date("2024-01-15"),
      progress: {
        completedSteps: 2,
        totalSteps: 4,
        coursesCompleted: 3,
        totalCourses: 12
      },
      subscription: {
        plan: "free",
        status: "active",
        startDate: "2024-01-15T00:00:00.000Z",
        endDate: null,
        autoRenew: false
      }
    };
    
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);
  }, []);

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return { user, loading, updateUser };
};