
import React from 'react';
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <FileQuestion className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Seite nicht gefunden</h2>
          
          <p className="text-gray-600 mb-8">
            Die angeforderte Seite existiert nicht oder wurde möglicherweise verschoben.
          </p>
          
          <div className="space-y-3">
            <Link to="/">
              <Button className="w-full">Zur Startseite</Button>
            </Link>
            <p className="text-sm text-gray-500">
              Oder <Link to="/contact" className="text-blue-600 hover:underline">kontaktiere uns</Link> bei Problemen.
            </p>
          </div>
        </div>
      </div>
      
      <Footer hideApplyButton={true} />
    </div>
  );
};

export default NotFound;
