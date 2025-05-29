import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import flightLogo from '../assets/flight.jpg';
import { useEffect } from 'react';

const HeaderPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getButtonClasses = (path) => 
    `px-5 py-2 mx-2 rounded-md no-underline cursor-pointer transition-all duration-300 flex items-center gap-2
     ${location.pathname === path 
       ? 'bg-gray-700 text-white' 
       : 'bg-transparent text-gray-800 border border-gray-300'}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.relative') === null) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center p-2 px-8 bg-gray-50 shadow-sm">
        <img 
          src={flightLogo} 
          alt="Flight Logo" 
          className="h-10 rounded" 
        />
        {isAuthenticated && (
          <span className="ml-auto">Welcome, {user.firstName}</span>
        )}
      </div>
      <nav className="flex justify-end items-center p-4 px-8 bg-gray-50 shadow-sm gap-4">
        <button
          onClick={() => navigate('/book')}
          className={getButtonClasses('/book')}
        >
          Book
        </button>
        
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={getButtonClasses('/manage')}
          >
            Manage 
            <svg className={`w-4 h-4 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button 
                onClick={() => {
                  navigate('/manage-flights');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Flights
              </button>
              <button 
                onClick={() => {
                  navigate('/manage-bookings');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Bookings
              </button>
              <button 
                onClick={() => {
                  navigate('/register');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Register User
              </button>
            </div>
          )}
        </div>
        
        {isAuthenticated ? (
          <button 
            onClick={logout}
            className={getButtonClasses()}
          >
            Log Out
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className={getButtonClasses('/login')}
          >
            Log In
          </button>
        )}
      </nav>
    </div>
  );
};

export default HeaderPage;