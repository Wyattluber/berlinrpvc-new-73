
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export const AdminMobileHeader: React.FC<{
  isAdmin: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}> = ({ isAdmin, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <div className="md:hidden bg-white border-b border-gray-200 py-4 px-4 flex items-center justify-between sticky top-0 z-10">
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
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[90%] p-0 h-[80vh] max-w-full">
        <div className="md:hidden bg-white flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Menü</h3>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
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
                      "flex items-center justify-between px-4 py-3 text-sm rounded-none transition-colors",
                      "text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-100"
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-3" />
                      {item.title}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                );
              }
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "flex justify-between w-full items-center rounded-none py-3 h-auto border-b border-gray-100",
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.title}
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
