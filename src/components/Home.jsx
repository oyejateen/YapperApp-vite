import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white bg-home-image">
      <nav className="p-4 absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-caribbean-green">YapperApp</Link>
          
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="hover:text-caribbean-green transition-colors">About</Link>
            <Link to="/" className="hover:text-caribbean-green transition-colors">Features</Link>
            <Link to="/" className="hover:text-caribbean-green transition-colors">Pricing</Link>
            <Link to="/" className="hover:text-caribbean-green transition-colors">Contact</Link>
          </div>
          
          <div className="hidden md:flex space-x-2">
            <button
              onClick={handleInstall}
              className="bg-caribbean-green text-black font-bold py-2 px-4 rounded-lg hover:bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:text-white transition duration-300"
            >
              Install
            </button>
            <Link to="/signup" className="bg-caribbean-green text-black font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition duration-300">
              Register
            </Link>
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={handleInstall}
              className="bg-caribbean-green text-black font-bold py-2 px-4 rounded-lg hover:bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:text-white transition duration-300"
            >
              Install
            </button>
            <button 
              className="text-caribbean-green"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-black bg-opacity-90 items-center justify-center rounded-lg p-4">
            <Link to="/" className="block py-2 hover:text-caribbean-green transition-colors">About</Link>
            <Link to="/" className="block py-2 hover:text-caribbean-green transition-colors">Features</Link>
            <Link to="/" className="block py-2 hover:text-caribbean-green transition-colors">Pricing</Link>
            <Link to="/" className="block py-2 hover:text-caribbean-green transition-colors">Contact</Link>
            <Link to="/" className="block py-2 mt-4 bg-caribbean-green text-black font-bold rounded-lg hover:bg-opacity-80 transition duration-300 text-center">
              Register
            </Link>
          </div>
        )}
      </nav>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-thin mb-6 leading-tight">
            Unleash Your Thoughts,<br />Embrace <span className="font-bold anonymity-text">Anonymity</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 font-light">Share your unfiltered ideas with the world.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup" className="bg-caribbean-green text-black font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition duration-300">
              Become a Yapper
            </Link>
            <Link to="/login" className="bg-transparent border-2 border-caribbean-green text-caribbean-green font-bold py-3 px-6 rounded-lg hover:bg-caribbean-green hover:text-black transition duration-300">
              Already a Yapper
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-black text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">YapperApp</h3>
              <p className="text-sm">Connect, share, and engage with communities.</p>
            </div>
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-caribbean-green transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-caribbean-green transition-colors">About</Link></li>
                <li><Link to="/features" className="hover:text-caribbean-green transition-colors">Features</Link></li>
                <li><Link to="/contact" className="hover:text-caribbean-green transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="hover:text-caribbean-green transition-colors">Privacy Policy</Link></li>
                <li><Link to="/tos" className="hover:text-caribbean-green transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} YapperApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;