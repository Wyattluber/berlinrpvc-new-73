
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageSquare, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-hamburg-blue text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Notruf Hamburg</h3>
            <p className="text-gray-300">
              Dein privater Notruf Hamburg Server und Discord Community.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-hamburg-red transition duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-gray-300 hover:text-hamburg-red transition duration-300">
                  Bewerben
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-gray-300 hover:text-hamburg-red transition duration-300">
                  Partner
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Folge Uns</h3>
            <div className="flex space-x-4">
              <a href="#" aria-label="Discord" className="text-gray-300 hover:text-hamburg-red transition duration-300">
                <MessageSquare size={24} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-300 hover:text-hamburg-red transition duration-300">
                <Instagram size={24} />
              </a>
              <a href="#" aria-label="Facebook" className="text-gray-300 hover:text-hamburg-red transition duration-300">
                <Facebook size={24} />
              </a>
              <a href="mailto:info@example.com" aria-label="Email" className="text-gray-300 hover:text-hamburg-red transition duration-300">
                <Mail size={24} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Notruf Hamburg. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
