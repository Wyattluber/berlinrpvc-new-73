
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageSquare, Mail, Youtube, Music } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">BerlinRP-VC</h3>
            <p className="text-blue-100">
              Dein privater BerlinRP-VC Server und Discord Community.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-100 hover:text-white transition duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-blue-100 hover:text-white transition duration-300">
                  Bewerben
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-blue-100 hover:text-white transition duration-300">
                  Partner
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">Folge Uns</h3>
            <div className="flex space-x-4 mb-3">
              <a href="https://discord.gg/berlinrpvc" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="text-blue-100 hover:text-white transition duration-300 transform hover:scale-110">
                <MessageSquare size={24} />
              </a>
              <a href="https://www.instagram.com/berlin.rp.vc" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-blue-100 hover:text-white transition duration-300 transform hover:scale-110">
                <Instagram size={24} />
              </a>
              <a href="https://www.tiktok.com/@berlin_rp_vc" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-blue-100 hover:text-white transition duration-300 transform hover:scale-110">
                <Music size={24} />
              </a>
              <a href="https://www.youtube.com/@BerlinRP-VC" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-blue-100 hover:text-white transition duration-300 transform hover:scale-110">
                <Youtube size={24} />
              </a>
            </div>
            <div className="mt-2">
              <a href="mailto:info@berlinrpvc.de" aria-label="Email" className="text-blue-100 hover:text-white transition duration-300 flex items-center gap-2">
                <Mail size={20} />
                <span>info@berlinrpvc.de</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-blue-600 mt-8 pt-6 text-center text-blue-100">
          <p>&copy; {new Date().getFullYear()} BerlinRP-VC. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
