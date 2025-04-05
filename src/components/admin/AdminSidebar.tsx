
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface AdminSidebarProps {
  isAdmin: boolean;
  menuItems: Array<{
    title: string;
    id: string;
    icon: React.ComponentType<any>;
  }>;
  activeSection: string;
  handleMenuClick: (id: string) => void;
}

export const AdminSidebar = ({ 
  isAdmin, 
  menuItems, 
  activeSection, 
  handleMenuClick 
}: AdminSidebarProps) => {
  return (
    <div className="hidden md:block md:w-64 bg-gray-50 border-r min-h-[calc(100vh-64px)]">
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold px-2 mb-4">
          {isAdmin ? "Admin Panel" : "Moderator Panel"}
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center px-2 py-2 text-sm rounded-md transition-colors ${
                activeSection === item.id
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.title}</span>
              {activeSection === item.id && <ChevronRight className="ml-auto h-4 w-4" />}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
