import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose, className }) => {
const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { name: "Courses", path: "/courses", icon: "BookOpen" },
    { name: "Community", path: "/community", icon: "Users" },
    { name: "Membership", path: "/membership", icon: "Crown" }
  ];

  const adminNavigation = [
    { name: "강의 관리", path: "/admin/courses", icon: "Shield" }
  ];

  // Desktop sidebar - static positioning
  const DesktopSidebar = () => (
<div className="hidden lg:flex h-full w-64 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col w-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold gradient-text">
            StrongPoint Academy
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                )
              }
            >
              <ApperIcon name={item.icon} className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
          
          {/* Admin Section */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-2 px-4">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Admin
              </span>
            </div>
            {adminNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                  )
                }
              >
                <ApperIcon name={item.icon} className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

{/* Bottom section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-accent-500/10 to-primary-500/10 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              프리미엄으로 업그레이드
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              모든 강의와 기능을 이용해보세요
            </p>
            <NavLink
              to="/membership"
              className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white px-4 py-2 rounded-lg font-medium hover:from-accent-600 hover:to-accent-700 transition-all duration-200 flex items-center justify-center"
            >
              업그레이드
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );

// Mobile sidebar - overlay with transform
  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        "lg:hidden fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-surface shadow-xl z-50 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold gradient-text">
              StrongPoint Academy
            </h1>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                  )
                }
              >
                <ApperIcon name={item.icon} className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
            
            {/* Admin Section */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-2 px-4">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Admin
                </span>
              </div>
              {adminNavigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                    )
                  }
                >
                  <ApperIcon name={item.icon} className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </nav>
          {/* Bottom section */}
<div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-accent-500/10 to-primary-500/10 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                프리미엄으로 업그레이드
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                모든 강의와 기능을 이용해보세요
              </p>
              <NavLink
                to="/membership"
                className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white px-4 py-2 rounded-lg font-medium hover:from-accent-600 hover:to-accent-700 transition-all duration-200 flex items-center justify-center"
              >
                업그레이드
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={className}>
      <DesktopSidebar />
      <MobileSidebar />
    </div>
  );
};

export default Sidebar;