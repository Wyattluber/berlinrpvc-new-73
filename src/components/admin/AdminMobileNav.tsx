
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminMobileHeader: React.FC<{
  isAdmin: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}> = ({ isAdmin, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <div className="md:hidden bg-white border-b border-gray-200 py-4 px-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">
        {isAdmin ? 'Admin Bereich' : 'Moderator Bereich'}
      </h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export const AdminMobileSidebar: React.FC<{
  menuItems: {
    title: string;
    id: string;
    icon: any;
    externalUrl?: string;
  }[];
  activeSection: string;
  handleMenuClick: (id: string) => void;
}> = ({ menuItems, activeSection, handleMenuClick }) => {
  return (
    <div className="md:hidden fixed inset-0 z-40 bg-gray-800 bg-opacity-50">
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-lg p-4 overflow-y-auto">
        <div className="space-y-2 py-4">
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
                  <Icon className="h-5 w-5 mr-3" />
                  {item.title} ↗
                </a>
              );
            }
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "flex justify-start w-full items-center",
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => handleMenuClick(item.id)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.title}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
