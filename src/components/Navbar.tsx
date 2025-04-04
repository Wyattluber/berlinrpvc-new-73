
import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SessionContext } from '../App';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, Home, Users, Server, BookOpen, Shield, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { checkIsAdmin } from '@/lib/admin';

const Navbar = () => {
  const session = useContext(SessionContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      }
    };
    
    checkAdminStatus();
  }, [session]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Erfolgreicher Logout",
        description: "Du wurdest erfolgreich ausgeloggt.",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Fehler beim Logout",
        description: "Es gab ein Problem beim Ausloggen.",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white sticky top-0 z-10 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">BerlinRP-VC</span>
          </Link>
          
          {isMobile ? (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-blue-800">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gradient-to-b from-blue-900 to-indigo-900 text-white border-blue-700 w-[300px]">
                <div className="flex flex-col h-full">
                  <div className="flex-1 mt-10">
                    <div className="space-y-6 px-2">
                      <div className="space-y-2">
                        <Link 
                          to="/" 
                          className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-blue-800 transition-colors"
                        >
                          <Home className="mr-2 h-4 w-4" />
                          Startseite
                        </Link>
                        <Link 
                          to="/subservers" 
                          className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-blue-800 transition-colors"
                        >
                          <Server className="mr-2 h-4 w-4" />
                          Subserver
                        </Link>
                        <Link 
                          to="/partners" 
                          className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-blue-800 transition-colors"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Partner
                        </Link>
                        
                        {session ? (
                          <>
                            <Link 
                              to="/profile" 
                              className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-blue-800 transition-colors"
                            >
                              <User className="mr-2 h-4 w-4" />
                              Mein Profil
                            </Link>
                            
                            {isAdmin && (
                              <Link 
                                to="/profile?tab=admin" 
                                className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-blue-800 transition-colors"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Admin Panel
                              </Link>
                            )}
                            
                            <button 
                              onClick={handleLogout}
                              className="flex w-full items-center px-3 py-2 rounded-md text-sm hover:bg-red-800 transition-colors"
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Logout
                            </button>
                          </>
                        ) : (
                          <>
                            <Link 
                              to="/login" 
                              className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-blue-800 transition-colors"
                            >
                              <User className="mr-2 h-4 w-4" />
                              Login
                            </Link>
                            {!isAdmin && (
                              <Link 
                                to="/apply" 
                                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm mt-4 transition-colors"
                              >
                                <BookOpen className="mr-2 h-4 w-4" />
                                Bewerben
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
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
                    <NavigationMenuItem>
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
                    </NavigationMenuItem>
                  ) : (
                    <>
                      <NavigationMenuItem>
                        <Link to="/login">
                          <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-white bg-transparent hover:bg-blue-800 hover:text-white`}>
                            Login
                          </NavigationMenuLink>
                        </Link>
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
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
