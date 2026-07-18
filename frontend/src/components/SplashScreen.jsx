import React from 'react';
import { Loader2 } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-8 animate-pulse">
        <div className="bg-pink-600 text-white p-3 rounded-xl">
          <span className="font-bold text-4xl">E</span>
        </div>
        <span className="font-bold text-4xl text-gray-800">kart</span>
      </div>

      {/* Loading Spinner & Text */}
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Loading Ekart...</h2>
          <p className="text-sm text-gray-500 mt-2">Waking up the server, please wait...</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
