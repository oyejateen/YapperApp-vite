import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBars } from '@fortawesome/free-solid-svg-icons';

function Navbar({ showBackButton = false, isAuthPage = false }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <nav className={`${isAuthPage ? 'bg-transparent' : 'bg-white shadow-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-1 flex items-center justify-start">
            {showBackButton && (
              <button onClick={handleBack} className={`${isAuthPage ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Link to="/" className={`text-2xl font-bold ${isAuthPage ? 'text-white' : 'text-gray-900'}`}>YapperApp</Link>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              {currentUser ? (
                <>
                  <Link to="/dashboard" className={`${isAuthPage ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}>Dashboard</Link>
                  <button onClick={logout} className={`${isAuthPage ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className={`${isAuthPage ? 'text-caribbean-green border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-caribbean-green' : 'text-gray-700 hover:text-gray-900'}`}>Login</Link>
                  <Link to="/signup" className={`${isAuthPage ? 'text-caribbean-green border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-caribbean-green' : 'text-gray-700 hover:text-gray-900'}`}>Sign Up</Link>
                </>
              )}
            </div>
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${isAuthPage ? 'text-white' : 'text-gray-600'} hover:text-gray-900 focus:outline-none`}
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 mt-4">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Dashboard</Link>
                <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Login</Link>
                <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;