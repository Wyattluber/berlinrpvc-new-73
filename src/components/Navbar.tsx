
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, User, LogOut, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SessionContext } from '@/App';
import { checkIsAdmin, checkIsModerator } from '@/lib/admin';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const session = useContext(SessionContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const authCheck = async () => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        try {
          const adminStatus = await checkIsAdmin();
          const modStatus = await checkIsModerator();
          console.log("Admin status check result:", adminStatus);
          console.log("Moderator status check result:", modStatus);
          setIsAdmin(adminStatus);
          setIsModerator(modStatus);
        } catch (error) {
          console.error("Error checking user status:", error);
          setIsAdmin(false);
          setIsModerator(false);
        }
      } else {
        setIsAdmin(false);
        setIsModerator(false);
      }
    };
    
    authCheck();
  }, [session, location]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      // Überprüfe, ob eine aktive Session existiert
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // Falls keine Session existiert, direkt zur Homepage navigieren und UI aktualisieren
        toast({
          title: "Bereits abgemeldet",
          description: "Du bist bereits abgemeldet."
        });
        
        navigate('/');
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (error.name === "AuthSessionMissingError") {
          // Falls Fehler auf fehlende Session hinweist, trotzdem zur Homepage navigieren
          toast({
            title: "Abgemeldet",
            description: "Du wurdest erfolgreich abgemeldet."
          });
          
          navigate('/');
          return;
        }
        throw error;
      }
      
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Du wurdest erfolgreich abgemeldet."
      });
      
      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsModerator(false);
      navigate('/');
    } catch (error: any) {
      console.error("Logout error:", error);
      
      // Selbst bei Fehler zur Homepage navigieren
      toast({
        title: "Abmeldeversuch",
        description: "Deine Sitzung wurde zurückgesetzt.",
        variant: "default"
      });
      
      navigate('/');
    }
  };

  const shouldShowApplyButton = !isAdmin && !isModerator;

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
                
                {isAdmin && (
                  <Link to="/admin" className="hover:text-blue-200 py-2 px-3 rounded transition duration-300 flex items-center gap-1">
                    <ShieldCheck size={18} />
                    <span>Admin</span>
                  </Link>
                )}
                
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
            
            {shouldShowApplyButton && (
              <Button variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md border-0 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <Link to="/apply/form">Jetzt Bewerben</Link>
              </Button>
            )}
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
                
                {isAdmin && (
                  <Link to="/admin"
                    className="block hover:bg-blue-500 py-2 px-3 rounded transition duration-300 flex items-center gap-2"
                    onClick={toggleMenu}
                  >
                    <ShieldCheck size={18} />
                    <span>Admin</span>
                  </Link>
                )}
                
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
            
            {shouldShowApplyButton && (
              <Button 
                variant="default" 
                className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md border-0"
                onClick={toggleMenu}
              >
                <Link to="/apply/form" className="w-full">Jetzt Bewerben</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
