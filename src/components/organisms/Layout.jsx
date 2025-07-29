import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/organisms/Header";
import Sidebar from "@/components/organisms/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/ui/Loading";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={handleSidebarClose} 
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header 
            user={user}
            onMenuToggle={handleMenuToggle}
          />

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-background dark:bg-dark-background">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;