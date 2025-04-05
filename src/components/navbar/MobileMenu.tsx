
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, LogOut, Home, Users, Server, BookOpen, Shield, User } from 'lucide-react';

interface MobileMenuProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  menuItems: {
    to: string;
    icon: React.ElementType;
    label: string;
  }[];
  userMenuItems: {
    to: string;
    icon: React.ElementType;
    label: string;
    highlight?: boolean;
  }[];
  session: any;
  handleLogout: () => Promise<void>;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  sidebarOpen,
  setSidebarOpen,
  menuItems,
  userMenuItems,
  session,
  handleLogout
}) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setSidebarOpen(false)}>
      </div>
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-900 to-indigo-900 shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-blue-800 flex items-center justify-between">
            <span className="font-bold text-xl text-white">Navigation</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-blue-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => (
                <Link 
                  key={item.to} 
                  to={item.to}
                  className="flex items-center px-3 py-2 rounded-md text-sm text-white hover:bg-blue-800 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t border-blue-800">
                {userMenuItems.map((item) => (
                  <Link 
                    key={item.to} 
                    to={item.to}
                    className={`flex items-center px-3 py-2 rounded-md text-sm text-white transition-colors ${
                      item.highlight ? 'bg-blue-700 hover:bg-blue-600' : 'hover:bg-blue-800'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                
                {session && (
                  <button 
                    onClick={() => {
                      handleLogout();
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 mt-2 rounded-md text-sm text-red-300 hover:bg-red-900 hover:text-white transition-colors"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
