import React, { useContext, useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import RoleBadge from "@/components/molecules/RoleBadge";
import { cn } from "@/utils/cn";
const Header = ({ user, onMenuToggle, className }) => {
const [showUserMenu, setShowUserMenu] = useState(false);
  const { isDark, setIsDark } = useDarkMode();
  const { logout } = useContext(AuthContext);
  return (
    <header
    className={cn(
        "bg-white/95 dark:bg-dark-surface/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50",
        className
    )}>
    <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button */}
        <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ApperIcon name="Menu" className="w-6 h-6" />
        </button>
        {/* Logo - hidden on mobile when sidebar is present */}
        <div className="hidden lg:flex items-center">
            <h1 className="text-xl font-bold gradient-text">StrongPoint Academy
                          </h1>
        </div>
        {/* Right section */}
<div className="flex items-center gap-4">
            {/* Dark mode toggle */}
            <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                disabled={!isDark && !setIsDark}>
                <ApperIcon
                    name={isDark ? "Sun" : "Moon"}
                    className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {/* Notifications */}
                <button
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                    <ApperIcon name="Bell" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div
                            className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {user?.name?.[0] || "U"}
                            </span>
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user?.name || "사용자"}
                            </p>
                            <RoleBadge role={user?.role} />
                        </div>
                        <ApperIcon name="ChevronDown" className="w-4 h-4 text-gray-500" />
                    </button>
                    {/* User dropdown */}
                    {showUserMenu && <div
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <p className="font-medium text-gray-900 dark:text-white">
                                {user?.name || "사용자"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.email}
                            </p>
                            <div className="mt-2">
                                <RoleBadge role={user?.role} />
                            </div>
</div>
                        <div className="p-2">
                            <button
                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <ApperIcon name="User" className="w-4 h-4" />프로필 설정
                            </button>
                            <button
                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <ApperIcon name="Settings" className="w-4 h-4" />환경 설정
                            </button>
                            <button
                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <ApperIcon name="HelpCircle" className="w-4 h-4" />도움말
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                                <button
                                    onClick={() => {
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <ApperIcon name="LogOut" className="w-4 h-4" />로그아웃
                                </button>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
        </div>
</header>
  );
};

export default Header;