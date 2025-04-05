
import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNavigation from './navbar/MobileNavigation';
import DesktopNavigation from './navbar/DesktopNavigation';
import MobileMenu from './navbar/MobileMenu';
import { useNavbarState } from './navbar/useNavbarState';
import { getMenuItems, getUserMenuItems } from './navbar/getMenuItems';

const Navbar = () => {
  const {
    session,
    isAdmin,
    sidebarOpen,
    setSidebarOpen,
    handleLogout
  } = useNavbarState();
  
  const isMobile = useIsMobile();
  const menuItems = getMenuItems();
  const userMenuItems = getUserMenuItems(session, isAdmin);
  
  return (
    <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {isMobile && (
              <Link to="/" className="text-xl font-bold flex items-center">
                <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">BerlinRP-VC</span>
              </Link>
            )}
            {!isMobile && (
              <Link to="/" className="text-xl font-bold flex items-center">
                <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">BerlinRP-VC</span>
              </Link>
            )}
          </div>
          
          {isMobile ? (
            <MobileNavigation
              session={session}
              isAdmin={isAdmin}
              setSidebarOpen={setSidebarOpen}
              handleLogout={handleLogout}
            />
          ) : (
            <DesktopNavigation
              session={session}
              isAdmin={isAdmin}
              handleLogout={handleLogout}
            />
          )}
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <MobileMenu
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          menuItems={menuItems}
          userMenuItems={userMenuItems}
          session={session}
          handleLogout={handleLogout}
        />
      )}
    </header>
  );
};

export default Navbar;
