
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
import { Menu, X, User, LogOut, Home, Users, Server, BookOpen, Shield, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { checkIsAdmin } from '@/lib/admin';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarRail
} from "@/components/ui/sidebar";

const Navbar = () => {
  const session = useContext(SessionContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
    setSidebarOpen(false);
  }, [location.pathname]);
  
  // Desktop sidebar menu items
  const menuItems = [
    { to: "/", icon: Home, label: "Startseite" },
    { to: "/subservers", icon: Server, label: "Subserver" },
    { to: "/partners", icon: Users, label: "Partner" },
  ];

  // User-specific menu items
  const userMenuItems = session ? [
    { to: "/profile", icon: User, label: "Mein Profil" },
    ...(isAdmin ? [{ to: "/profile?tab=admin", icon: Shield, label: "Admin Panel" }] : []),
  ] : [
    { to: "/login", icon: User, label: "Login" },
    { to: "/apply", icon: BookOpen, label: "Bewerben", highlight: true },
  ];
  
  return (
    <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-blue-800 mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
            <Link to="/" className="text-xl font-bold flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">BerlinRP-VC</span>
            </Link>
          </div>
          
          {isMobile ? (
            // Mobile menu
            <div className="flex items-center">
              {session ? (
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
          ) : (
            // Desktop menu
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
      
      {/* Mobile Sidebar - verbesserte Version */}
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
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
    </header>
  );
};

export default Navbar;
