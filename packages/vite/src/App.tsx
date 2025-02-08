// src/miniapp/App.tsx
import React, { useState } from 'react';
import { supabase } from './supabase';

declare global {
  interface Window {
    Telegram: any;
  }
}

const App: React.FC = () => {
  const [verified, setVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const tg = window.Telegram?.WebApp;

  const handleVerification = async () => {
    if (!tg || isVerifying) return;
    
    setIsVerifying(true);
    
    try {
      const userData = tg.initDataUnsafe?.user;
      if (!userData?.id) {
        throw new Error('No user ID available');
      }

      const browserInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory,
        webdriver: navigator.webdriver,
      };

      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      const graphicsInfo = gl ? {
        renderer: gl.getParameter(gl.RENDERER),
        vendor: gl.getParameter(gl.VENDOR),
        version: gl.getParameter(gl.VERSION)
      } : {};

      await supabase
        .from('verification_attempts')
        .insert([{
          user_id: userData.id,
          browser_info: browserInfo,
          graphics_info: graphicsInfo,
          verification_passed: true,
        }]);

      setVerified(true);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          {verified ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Verification Complete!
              </h1>
              <p className="text-gray-600">
                Close the window and Check your Telegram messages for the group invite link.
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Verify Your Account
              </h1>
              <p className="text-gray-600 mb-8">
                Click the button below to verify and join our group.
              </p>
              <button
                onClick={handleVerification}
                disabled={isVerifying}
                className={`
                  w-full py-4 px-6 rounded-lg text-white font-semibold
                  transform transition-all duration-200
                  ${isVerifying 
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                  }
                `}
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Now'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;