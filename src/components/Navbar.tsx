
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-hamburg-blue text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="font-bold text-xl">Notruf Hamburg</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="hover:text-hamburg-red py-2 px-3 rounded transition duration-300">
              Home
            </Link>
            <Link to="/apply" className="hover:text-hamburg-red py-2 px-3 rounded transition duration-300">
              Bewerben
            </Link>
            <Link to="/partners" className="hover:text-hamburg-red py-2 px-3 rounded transition duration-300">
              Partner
            </Link>
            <Button variant="default" className="bg-hamburg-red hover:bg-red-700 text-white rounded-md">
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
              className="block hover:bg-hamburg-red py-2 px-3 rounded transition duration-300"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link to="/apply" 
              className="block hover:bg-hamburg-red py-2 px-3 rounded transition duration-300"
              onClick={toggleMenu}
            >
              Bewerben
            </Link>
            <Link to="/partners" 
              className="block hover:bg-hamburg-red py-2 px-3 rounded transition duration-300"
              onClick={toggleMenu}
            >
              Partner
            </Link>
            <Button 
              variant="default" 
              className="w-full mt-2 bg-hamburg-red hover:bg-red-700 text-white rounded-md"
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
