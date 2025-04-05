
import React from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminMobileNavProps {
  isAdmin: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  menuItems: Array<{
    title: string;
    id: string;
    icon: React.ComponentType<any>;
  }>;
  activeSection: string;
  handleMenuClick: (id: string) => void;
}

export const AdminMobileHeader = ({ 
  isAdmin, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: Pick<AdminMobileNavProps, 'isAdmin' | 'mobileMenuOpen' | 'setMobileMenuOpen'>) => {
  return (
    <div className="md:hidden border-b py-3 px-4 flex items-center justify-between sticky top-0 bg-white z-10">
      <h1 className="text-xl font-semibold">
        {isAdmin ? "Admin Panel" : "Moderator Panel"}
      </h1>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export const AdminMobileSidebar = ({ 
  menuItems, 
  activeSection, 
  handleMenuClick 
}: Pick<AdminMobileNavProps, 'menuItems' | 'activeSection' | 'handleMenuClick'>) => {
  return (
    <div className="md:hidden bg-white w-full border-b shadow-sm z-10">
      <nav className="py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm ${
              activeSection === item.id
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700"
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            <span>{item.title}</span>
            {activeSection === item.id && <ChevronRight className="ml-auto h-4 w-4" />}
          </button>
        ))}
      </nav>
    </div>
  );
};
