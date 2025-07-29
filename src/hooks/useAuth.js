import { useSelector } from 'react-redux';

export const useAuth = () => {
  const userState = useSelector((state) => state.user);
  
  return {
    user: userState?.user || null,
    loading: false, // Authentication is managed by ApperUI
    isAuthenticated: userState?.isAuthenticated || false,
    updateUser: () => {
      // User updates are now handled through Redux in App.jsx
      console.log('User updates handled by Redux store');
    }
  };
};