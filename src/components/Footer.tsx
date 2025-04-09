import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SessionContext } from '../contexts/AuthContext';
import { checkIsAdmin } from '@/lib/admin';
import { useState, useEffect } from 'react';

interface FooterProps {
  hideApplyButton?: boolean;
}

const Footer: React.FC<FooterProps> = ({ hideApplyButton = false }) => {
  const session = useContext(SessionContext);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      }
    };
    
    checkAdminStatus();
  }, [session]);

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">BerlinRP-VC</h3>
            <p className="text-gray-300 mb-4">
              Ein deutscher Roblox Roleplay Server mit dem Fokus auf realistische Simulationen und Erlebnisse.
            </p>
            {!hideApplyButton && !isAdmin && (
              <Link to="/apply">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800">
                  Jetzt bewerben
                </Button>
              </Link>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Startseite</Link>
              </li>
              <li>
                <Link to="/partners" className="text-gray-300 hover:text-white">Partner</Link>
              </li>
              <li>
                <Link to="/subservers" className="text-gray-300 hover:text-white">Subserver</Link>
              </li>
              {session ? (
                <li>
                  <Link to="/profile" className="text-gray-300 hover:text-white">Mein Profil</Link>
                </li>
              ) : (
                <li>
                  <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:kontakt@berlinrp.de" className="text-gray-300 hover:text-white">
                  kontakt@berlinrpvc.de
                </a>
              </li>
              <li className="flex items-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a7/Discord_logo_2023.svg"
                  alt="Discord"
                  className="h-5 w-5 mr-2"
                  onError={(e) => e.currentTarget.src = "fallback-image-url"} // Fallback-Bild hinzufügen, falls das Bild nicht lädt
                />
                <a href="https://discord.gg/berlinrpvc" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} BerlinRP-VC. Alle Rechte vorbehalten.
          </p>
          <div className="flex space-x-4">
            <Link to="/datenschutz" className="text-gray-400 hover:text-white text-sm">Datenschutz</Link>
            <Link to="/impressum" className="text-gray-400 hover:text-white text-sm">Impressum</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
