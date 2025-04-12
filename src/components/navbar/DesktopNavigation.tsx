
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from '@/components/ui/button';
import UserDropdown from './UserDropdown';

interface DesktopNavigationProps {
  session: any;
  isAdmin: boolean;
  handleLogout: () => Promise<void>;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  session,
  isAdmin,
  handleLogout
}) => {
  return (
    <div className="flex items-center space-x-4">
      <NavigationMenu className="bg-transparent">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link to="/">
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-white bg-transparent hover:bg-blue-800 hover:text-white`}>
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/subservers">
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-white bg-transparent hover:bg-blue-800 hover:text-white`}>
                Subserver
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/partners">
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-white bg-transparent hover:bg-blue-800 hover:text-white`}>
                Partner
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          {session ? (
            <>
              <NavigationMenuItem>
                <UserDropdown 
                  session={session} 
                  isAdmin={isAdmin} 
                  handleLogout={handleLogout} 
                />
              </NavigationMenuItem>
              
              {!isAdmin && (
                <NavigationMenuItem>
                  <Link to="/apply">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0">
                      Bewerben
                    </Button>
                  </Link>
                </NavigationMenuItem>
              )}
            </>
          ) : (
            <>
              <NavigationMenuItem>
                <Link to="/login">
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-white bg-transparent hover:bg-blue-800 hover:text-white`}>
                    Login
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/apply">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0">
                    Bewerben
                  </Button>
                </Link>
              </NavigationMenuItem>
            </>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default DesktopNavigation;
