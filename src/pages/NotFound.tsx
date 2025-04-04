
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-9xl font-extrabold text-gray-900 mb-4">404</h1>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent mb-8"></div>
          <h2 className="text-3xl font-bold mb-4">Seite nicht gefunden</h2>
          <p className="text-gray-600 mb-8">
            Die von dir gesuchte Seite existiert leider nicht oder wurde verschoben. Bitte überprüfe die URL und versuche es erneut.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link to="/">
                <Home className="h-4 w-4" /> Startseite
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex items-center gap-2">
              <button onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" /> Zurück
              </button>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 max-w-2xl">
          <h3 className="text-lg font-medium mb-4">Vielleicht suchst du nach folgenden Bereichen:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/apply" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Bewerbung</h4>
                <p className="text-sm text-gray-500">Bewirb dich bei BerlinRP-VC</p>
              </div>
            </Link>
            <Link to="/partners" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-4">
                <Search className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Partner</h4>
                <p className="text-sm text-gray-500">Unsere Partner Server</p>
              </div>
            </Link>
            <Link to="/profile" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center">
              <div className="bg-purple-100 p-2 rounded-full mr-4">
                <Search className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Profil</h4>
                <p className="text-sm text-gray-500">Dein persönlicher Bereich</p>
              </div>
            </Link>
            <Link to="/datenschutz" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center">
              <div className="bg-yellow-100 p-2 rounded-full mr-4">
                <Search className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Datenschutz</h4>
                <p className="text-sm text-gray-500">Informationen zum Datenschutz</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
