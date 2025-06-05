import { useState, useEffect } from 'react';
import http from '../services/http';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // For error handling
  const [errors, setErrors] = useState({
    userNameOrEmail: '',
    password: '',
    serverError: ''
  });

  const navigate = useNavigate();
  const { setAuthState, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (sessionStorage.getItem('fromUrl')) {
        const fromUrl = sessionStorage.getItem('fromUrl');
        navigate(fromUrl);
      } else {
        navigate('/');
      }
    } 
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // validation errors
    const newErrors = {};
    
    if (!userNameOrEmail) {
      newErrors.userNameOrEmail = 'Username or email is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userNameOrEmail)) {
      newErrors.userNameOrEmail = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain at least one letter and one number';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
          const response = await http.post('/auth/login', {
          email: userNameOrEmail,
          password: password
        });

       const {token, user} = response.data.data;
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_info', JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.firstName
          }));
        }

        setAuthState({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName
          }
        });

        navigate('/');
  } catch (error) {

    console.error(error);
      const errorMessage = error.response?.data?.message 
          || error.message 
          || 'Authentication failed';

      if (error.response?.status === 400) {
          if (error.response?.data?.data?.errors) {
              if (error.response.data.data.errors.email) {
                console.log(error.response.data.data.errors.email);
                setErrors(prev => ({
                  ...prev,
                  ...error.response.data.data.errors,
                  serverError: error.response.data.data.errors.email}));
              } else if (error.response.data.data.errors.pwd) {
                setErrors(prev => ({
                  ...prev,
                  ...error.response.data.data.errors,
                  serverError: error.response.data.data.errors.pwd}));
              } else {
                  setErrors(prev => ({...prev, serverError: errorMessage }));
              }
          } else {
              setErrors(prev => ({...prev, serverError: errorMessage }));
          }
      } else {
          setErrors(prev => ({...prev, serverError: errorMessage }));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
            <span className="icon-lock text-white text-2xl" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8 mt-4">
          Welcome back
        </h2>

        {errors.serverError && (
          <div className="text-red-500 text-center mb-4">
            {errors.serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative mb-4">
                <label
                  id="username-label"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username or email
                </label>
            <div className="relative">
              <input
                id="email"
                type="text"
                placeholder="Enter your username or email"
                className="w-full pl-5 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-all"
                style={{ height:48, width: 300}}
                value={userNameOrEmail}
                onChange={(e) => setUserNameOrEmail(e.target.value)}
              />
              {errors.userNameOrEmail && (
              <span className="text-red-500 text-sm mt-1 block">
                  {errors.userNameOrEmail}
              </span>
              )}
            </div>
          </div>
          <div className="relative mb-4">
                <label
                  id="password-label" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full pl-5 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-all"
                style={{ height: 48, width: 300}}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
              <span className="text-red-500 text-sm mt-1 block">
                  {errors.password}
              </span>
              )}
            </div>
          </div>
          {/* Login button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
            >
              Sign In
            </button>
            <div className="text-center text-sm text-gray-600 mt-4 space-y-2">
            <div>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div>
              Don't have an account? {' '}
              <a href="" onClick={() => navigate('/register')} className="text-blue-600 hover:underline">
                Sign up
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;