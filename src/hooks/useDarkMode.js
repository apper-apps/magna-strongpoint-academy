import { useState, useEffect } from "react";

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [themeSettings, setThemeSettings] = useState(null);

  // Initialize theme from database and localStorage
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Dynamically import theme service to avoid circular dependencies
        const { themeToggleService } = await import('@/services/api/themeToggleService');
        
        const settings = await themeToggleService.getSettings();
        setThemeSettings(settings);

        if (!settings.enable_dark_mode) {
          setIsDark(false);
          setLoading(false);
          return;
        }

        let initialTheme = false;

        // Check localStorage if persistence is enabled
        if (settings.persist_in_local_storage) {
          const stored = localStorage.getItem('dark-mode');
          if (stored !== null) {
            initialTheme = JSON.parse(stored);
          } else {
            // Fallback to system preference
            initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
          }
        } else {
          // Always use system preference if persistence is disabled
          initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }

        setIsDark(initialTheme);
      } catch (error) {
        console.error("Error initializing theme:", error.message);
        // Fallback to system preference
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mediaQuery.matches);
      } finally {
        setLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Listen for system theme changes when localStorage persistence is disabled
  useEffect(() => {
    if (loading || !themeSettings) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      // Only update if localStorage persistence is disabled
      if (!themeSettings.persist_in_local_storage) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [loading, themeSettings]);

  // Apply dark class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Enhanced setIsDark that persists to database and localStorage
  const toggleDarkMode = async (newValue) => {
    try {
      setIsDark(newValue);

      if (themeSettings) {
        // Save to localStorage if persistence is enabled
        if (themeSettings.persist_in_local_storage) {
          localStorage.setItem('dark-mode', JSON.stringify(newValue));
        }

        // Update database to track theme usage (optional)
        const { themeToggleService } = await import('@/services/api/themeToggleService');
        await themeToggleService.saveThemePreference(newValue);
      }
    } catch (error) {
      console.error("Error saving theme preference:", error.message);
      // Still update the UI even if database save fails
      setIsDark(newValue);
    }
  };

  return { 
    isDark, 
    setIsDark: toggleDarkMode,
    loading,
    themeSettings
  };
};