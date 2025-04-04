
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SessionContext } from '@/App';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const session = useContext(SessionContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth status when component mounts or location changes
    setIsLoggedIn(!!session);
  }, [session, location]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Du wurdest erfolgreich abgemeldet."
      });
      
      setIsLoggedIn(false);
      navigate('/');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Abmeldefehler",
        description: error.message || "Es gab einen Fehler bei der Abmeldung.",
        variant: "destructive"
      });
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">BerlinRP-VC</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link to="/" className="hover:text-blue-200 py-2 px-3 rounded transition duration-300">
              Home
            </Link>
            <Link to="/partners" className="hover:text-blue-200 py-2 px-3 rounded transition duration-300">
              Partner
            </Link>
            <Link to="/subservers" className="hover:text-blue-200 py-2 px-3 rounded transition duration-300">
              Unterserver
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="hover:text-blue-200 py-2 px-3 rounded transition duration-300 flex items-center gap-1">
                  <User size={18} />
                  <span>Profil</span>
                </Link>
                
                <Button variant="ghost" className="hover:text-blue-200 text-white" onClick={handleLogout}>
                  <div className="flex items-center gap-2">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </div>
                </Button>
              </>
            ) : (
              <Button variant="ghost" className="hover:text-blue-200 text-white">
                <Link to="/login" className="flex items-center gap-2">
                  <User size={18} />
                  <span>Login</span>
                </Link>
              </Button>
            )}
            
            <Button variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md border-0 transition-all duration-300 hover:scale-105 hover:shadow-md">
              <Link to="/apply/form">Jetzt Bewerben</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 py-2">
            <Link to="/" 
              className="block hover:bg-blue-500 py-2 px-3 rounded transition duration-300"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link to="/partners" 
              className="block hover:bg-blue-500 py-2 px-3 rounded transition duration-300"
              onClick={toggleMenu}
            >
              Partner
            </Link>
            <Link to="/subservers" 
              className="block hover:bg-blue-500 py-2 px-3 rounded transition duration-300"
              onClick={toggleMenu}
            >
              Unterserver
            </Link>
            {isLoggedIn ? (
              <>
                <Link to="/profile"
                  className="block hover:bg-blue-500 py-2 px-3 rounded transition duration-300 flex items-center gap-2"
                  onClick={toggleMenu}
                >
                  <User size={18} />
                  <span>Profil</span>
                </Link>
                
                <button
                  className="block w-full text-left hover:bg-blue-500 py-2 px-3 rounded transition duration-300 flex items-center gap-2"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login"
                className="block hover:bg-blue-500 py-2 px-3 rounded transition duration-300 flex items-center gap-2"
                onClick={toggleMenu}
              >
                <User size={18} />
                <span>Login</span>
              </Link>
            )}
            <Button 
              variant="default" 
              className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md border-0"
              onClick={toggleMenu}
            >
              <Link to="/apply/form" className="w-full">Jetzt Bewerben</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
