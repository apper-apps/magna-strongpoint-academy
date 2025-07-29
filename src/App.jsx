import React, { createContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "@/store/userSlice";
import { ToastContainer } from "react-toastify";
import Login from "@/components/pages/Login";
import Signup from "@/components/pages/Signup";
import Callback from "@/components/pages/Callback";
import ErrorPage from "@/components/pages/ErrorPage";
import ResetPassword from "@/components/pages/ResetPassword";
import PromptPassword from "@/components/pages/PromptPassword";
import { useDarkMode } from "@/hooks/useDarkMode";
import "@/index.css";
import Layout from "@/components/organisms/Layout";
import Membership from "@/components/pages/Membership";
import Landing from "@/components/pages/Landing";
import Courses from "@/components/pages/Courses";
import Community from "@/components/pages/Community";
import Dashboard from "@/components/pages/Dashboard";
import AdminCourses from "@/components/pages/AdminCourses";
// Create auth context
export const AuthContext = createContext(null);

function AppComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useDarkMode(); // Initialize dark mode

  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  
  // Initialize ApperUI once when the app loads
useEffect(() => {
    const initializeApp = async () => {
      const { ApperClient, ApperUI } = window.ApperSDK;
      
      const client = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Load SEO defaults on app initialization
      try {
        const { seoDefaultsService } = await import('@/services/api/seoDefaultsService');
        const { schemaMarkupService } = await import('@/services/api/schemaMarkupService');
        
        const [seoData, schemaData] = await Promise.all([
          seoDefaultsService.getAll(),
          schemaMarkupService.getAll()
        ]);
        
        // Apply SEO defaults if available
        if (seoData.length > 0) {
          const seoDefaults = seoData[0];
          const currentTitle = document.title;
          if (seoDefaults.title_suffix && !currentTitle.includes(seoDefaults.title_suffix)) {
            document.title = currentTitle + seoDefaults.title_suffix;
          }
          
          // Update meta description if available
          const metaDesc = document.getElementById('dynamic-description');
          if (metaDesc && seoDefaults.meta_description) {
            metaDesc.setAttribute('content', seoDefaults.meta_description);
          }
          
          // Update OG image if available
          const ogImage = document.getElementById('dynamic-og-image');
          if (ogImage && seoDefaults.og_image) {
            ogImage.setAttribute('content', seoDefaults.og_image);
          }
        }
        
        // Apply schema markup if available
        if (schemaData.length > 0) {
          const schemaMarkup = schemaData[0];
          const structuredData = document.getElementById('structured-data');
          if (structuredData) {
            const schema = {
              "@context": "https://schema.org",
              "@type": schemaMarkup.type || "Course",
              "provider": {
                "@type": "Organization", 
                "name": schemaMarkup.provider || "JuntaeSchool"
              }
            };
            structuredData.textContent = JSON.stringify(schema, null, 2);
          }
        }
      } catch (error) {
        console.error('Error loading SEO configuration:', error);
      }
      
      // Initialize ApperUI
      ApperUI.setup(client, {
        target: '#authentication',
        clientId: import.meta.env.VITE_APPER_PROJECT_ID,
        view: 'both',
        onSuccess: function (user) {
          setIsInitialized(true);
          // CRITICAL: This exact currentPath logic must be preserved in all implementations
          // DO NOT simplify or modify this pattern as it ensures proper redirection flow
          let currentPath = window.location.pathname + window.location.search;
          let redirectPath = new URLSearchParams(window.location.search).get('redirect');
          const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                             currentPath.includes('/callback') || currentPath.includes('/error') || 
                             currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
          
          if (user) {
            // User is authenticated
            if (redirectPath) {
              navigate(redirectPath);
            } else if (!isAuthPage) {
              if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                navigate(currentPath);
              } else {
                navigate('/dashboard');
              }
            } else {
              navigate('/dashboard');
            }
            // Store user information in Redux
            dispatch(setUser(JSON.parse(JSON.stringify(user))));
          } else {
            // User is not authenticated
            if (!isAuthPage) {
              navigate(
                currentPath.includes('/signup')
                  ? `/signup?redirect=${currentPath}`
                  : currentPath.includes('/login')
                  ? `/login?redirect=${currentPath}`
                  : '/login'
              );
            } else if (redirectPath) {
              if (
                !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
              ) {
                navigate(`/login?redirect=${redirectPath}`);
              } else {
                navigate(currentPath);
              }
            } else if (isAuthPage) {
              navigate(currentPath);
            } else {
              navigate('/login');
            }
            dispatch(clearUser());
          }
        },
        onError: function(error) {
          console.error("Authentication failed:", error);
        }
      });
    };
    
    initializeApp();
  }, []);// No props and state should be bound
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
  
  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="loading flex items-center justify-center p-6 h-full w-full"><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg></div>;
  }
  
  return (
    <AuthContext.Provider value={authMethods}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
        <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
        <Route path="/landing" element={<Landing />} />
<Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="community" element={<Community />} />
          <Route path="membership" element={<Membership />} />
          <Route path="admin/courses" element={<AdminCourses />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </AuthContext.Provider>
  );
}

export default AppComponent;