
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield } from 'lucide-react';

interface UserDropdownProps {
  session: any;
  isAdmin: boolean;
  handleLogout: () => Promise<void>;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  session,
  isAdmin,
  handleLogout
}) => {
  return (
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
      <DropdownMenuContent className="w-56 bg-blue-900 border-blue-700 text-white" align="end" forceMount>
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
              <Shield className="mr-2 h-4 w-4" />
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
  );
};

export default UserDropdown;
