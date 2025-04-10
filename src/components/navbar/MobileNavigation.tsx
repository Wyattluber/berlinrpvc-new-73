
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut } from 'lucide-react';

interface MobileNavigationProps {
  session: any;
  isAdmin: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLogout: () => Promise<void>;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  session,
  isAdmin,
  setSidebarOpen,
  handleLogout
}) => {
  return (
    <div className="flex items-center">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-white hover:bg-blue-800 mr-2"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      {session ? (
        <>
          {!isAdmin && (
            <Link to="/apply" className="mr-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Bewerben
              </Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-transparent hover:bg-blue-800">
                <Avatar className="h-8 w-8 border-2 border-blue-400">
                  <AvatarImage 
                    src={session.user?.user_metadata?.avatar_url} 
                    alt={session.user?.user_metadata?.name || "Avatar"} 
                  />
                  <AvatarFallback className="bg-blue-700 text-white">
                    {session.user?.user_metadata?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-blue-900 border-blue-700 text-white" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user?.user_metadata?.name || "Benutzer"}
                  </p>
                  <p className="text-xs leading-none text-blue-300">
                    {session.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-blue-700" />
              <DropdownMenuItem asChild className="hover:bg-blue-800 cursor-pointer">
                <Link to="/profile" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mein Profil</span>
                </Link>
              </DropdownMenuItem>
              
              {isAdmin && (
                <DropdownMenuItem asChild className="hover:bg-blue-800 cursor-pointer">
                  <Link to="/profile?tab=admin" className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator className="bg-blue-700" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-300 hover:bg-red-900 hover:text-white cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <div className="flex gap-2">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:bg-blue-800">
              Login
            </Button>
          </Link>
          <Link to="/apply">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Bewerben
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;
