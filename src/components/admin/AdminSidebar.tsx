
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  isAdmin: boolean;
  menuItems: {
    title: string;
    id: string;
    icon: any;
    externalUrl?: string;
  }[];
  activeSection: string;
  handleMenuClick: (id: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isAdmin,
  menuItems,
  activeSection,
  handleMenuClick
}) => {
  return (
    <div className="hidden md:block bg-white border-r border-gray-200 w-64 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          {isAdmin ? 'Admin Bereich' : 'Moderator Bereich'}
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            if (item.externalUrl) {
              return (
                <a 
                  key={item.id}
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                    "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.title} ↗
                </a>
              );
            }
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "flex justify-start w-full items-center mb-1",
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => handleMenuClick(item.id)}
              >
                <Icon className="h-5 w-5 mr-2" />
                {item.title}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
