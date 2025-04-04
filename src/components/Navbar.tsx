
import { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, ShieldCheck } from 'lucide-react';
import { SessionContext } from '@/App';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { checkIsAdmin, checkIsModerator } from '@/lib/admin';
import { useMobileMenu } from '@/hooks/use-mobile';

const Navbar = () => {
  const session = useContext(SessionContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const { mobileMenuOpen, setMobileMenuOpen } = useMobileMenu();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user) {
      checkIsAdmin().then(result => setIsAdmin(result));
      checkIsModerator().then(result => setIsModerator(result));
    }
  }, [session]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Abgemeldet",
        description: "Du wurdest erfolgreich abgemeldet."
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Abmelden. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-indigo-200 bg-clip-text text-transparent">BerlinRP-VC</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/' 
                ? 'bg-blue-700 text-white' 
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              Startseite
            </Link>
            
            <Link 
              to="/subservers" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/subservers' 
                ? 'bg-blue-700 text-white' 
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              Subserver
            </Link>
            
            <Link 
              to="/partners" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/partners' 
                ? 'bg-blue-700 text-white' 
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              Partner
            </Link>
            
            <Link 
              to="/apply" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname.startsWith('/apply') 
                ? 'bg-blue-700 text-white' 
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              Bewerben
            </Link>
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Profil
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Benutzerkonto</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mein Profil</span>
                  </DropdownMenuItem>
                  {(isAdmin || isModerator) && (
                    <DropdownMenuItem onClick={() => navigate('/profile?tab=admin')}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Admin-Bereich</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Abmelden</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/login')} variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                Anmelden
              </Button>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Menü öffnen</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname === '/' 
              ? 'bg-blue-800 text-white' 
              : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Startseite
          </Link>
          
          <Link
            to="/subservers"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname === '/subservers' 
              ? 'bg-blue-800 text-white' 
              : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Subserver
          </Link>
          
          <Link
            to="/partners"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname === '/partners' 
              ? 'bg-blue-800 text-white' 
              : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Partner
          </Link>
          
          <Link
            to="/apply"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname.startsWith('/apply') 
              ? 'bg-blue-800 text-white' 
              : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Bewerben
          </Link>
          
          {session ? (
            <>
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/profile' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Mein Profil
              </Link>
              
              {(isAdmin || isModerator) && (
                <Link
                  to="/profile?tab=admin"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/profile' && location.search.includes('tab=admin')
                    ? 'bg-blue-800 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin-Bereich
                </Link>
              )}
              
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
              >
                Abmelden
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Anmelden
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
