import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white px-4">
      <div className="max-w-xl text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle size={64} className="text-yellow-400 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold">Wartungsarbeiten</h1>
        <p className="text-lg text-blue-100">
          Unsere Website ist derzeit nicht vollständig funktionsfähig. Wir arbeiten bereits daran, das Problem zu beheben.
        </p>
        <p className="text-sm text-gray-400">
          Bitte versuche es später erneut. Danke für dein Verständnis!
        </p>
        <div className="flex justify-center">
          <Button
            size="lg"
            variant="outline"
            className="text-white border-white/20 hover:bg-gradient-to-r from-blue-600 to-indigo-700 backdrop-blur-sm bg-white/5 group"
          >
            <a
              href="https://discord.gg/berlinrpvc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <span>Zum Discord</span>
              <ExternalLink size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
