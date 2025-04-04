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
    <header className="bg-gray-800 text-white sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Berlin RP</Link>
          
          {isMobile ? (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-800 text-white border-gray-700 w-[300px]">
                <div className="flex flex-col h-full">
                  <div className="flex-1 mt-10">
                    <div className="space-y-6 px-2">
                      <div className="space-y-2">
                        <Link 
                          to="/" 
                          className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                        >
                          <Home className="mr-2 h-4 w-4" />
                          Startseite
                        </Link>
                        <Link 
                          to="/subservers" 
                          className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                        >
                          <Server className="mr-2 h-4 w-4" />
                          Subserver
                        </Link>
                        <Link 
                          to="/partners" 
                          className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Partner
                        </Link>
                        
                        {session ? (
                          <>
                            <Link 
                              to="/profile" 
                              className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                            >
                              <User className="mr-2 h-4 w-4" />
                              Mein Profil
                            </Link>
                            
                            {isAdmin && (
                              <Link 
                                to="/profile?tab=admin" 
                                className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Admin Panel
                              </Link>
                            )}
                            
                            <button 
                              onClick={handleLogout}
                              className="flex w-full items-center px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Logout
                            </button>
                          </>
                        ) : (
                          <>
                            <Link 
                              to="/login" 
                              className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                            >
                              <User className="mr-2 h-4 w-4" />
                              Login
                            </Link>
                            {!isAdmin && (
                              <Link 
                                to="/apply" 
                                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm mt-4"
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
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Home
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/subservers">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Subserver
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/partners">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Partner
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  
                  {session ? (
                    <NavigationMenuItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                              <AvatarImage 
                                src={session.user?.user_metadata?.avatar_url} 
                                alt={session.user?.user_metadata?.name || "Avatar"} 
                              />
                              <AvatarFallback>
                                {session.user?.user_metadata?.name?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {session.user?.user_metadata?.name || "Benutzer"}
                              </p>
                              <p className="text-xs leading-none text-muted-foreground">
                                {session.user?.email}
                              </p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/profile">
                              <User className="mr-2 h-4 w-4" />
                              <span>Mein Profil</span>
                            </Link>
                          </DropdownMenuItem>
                          
                          {isAdmin && (
                            <DropdownMenuItem asChild>
                              <Link to="/profile?tab=admin">
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Admin Panel</span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={handleLogout}
                            className="text-red-500 cursor-pointer"
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
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Login
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                      
                      {!isAdmin && (
                        <NavigationMenuItem>
                          <Link to="/apply">
                            <Button className="bg-blue-600 hover:bg-blue-700">
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
