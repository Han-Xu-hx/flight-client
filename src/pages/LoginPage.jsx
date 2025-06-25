import { useState, useEffect } from 'react';
import http from '../services/http';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button, Field, Input, Label } from '@headlessui/react';
import clsx from 'clsx';


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

      const { token, user } = response.data.data;
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
              serverError: error.response.data.data.errors.email
            }));
          } else if (error.response.data.data.errors.pwd) {
            setErrors(prev => ({
              ...prev,
              ...error.response.data.data.errors,
              serverError: error.response.data.data.errors.pwd
            }));
          } else {
            setErrors(prev => ({ ...prev, serverError: errorMessage }));
          }
        } else {
          setErrors(prev => ({ ...prev, serverError: errorMessage }));
        }
      } else {
        setErrors(prev => ({ ...prev, serverError: errorMessage }));
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
            <Field>
              <Label className="text-sm font-medium">Username or email</Label>
              <Input
                id='username-input'
                className={clsx(
                  'mt-3 block w-80 rounded-lg border-1 border-blue-400/50 px-3 py-1.5 text-sm font-medium',
                  'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25'
                )}
                placeholder='Enter your username or email'
                value={userNameOrEmail}
                onChange={(e) => setUserNameOrEmail(e.target.value)}
              />
            </Field>
            {errors.userNameOrEmail && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.userNameOrEmail}
              </span>
            )}
          </div>
          <div className="relative mb-4">
            <Field>
              <Label className="text-sm font-medium">Password</Label>
              <Input
                id='password-input'
                className={clsx(
                  'mt-3 block w-80 rounded-lg border-1 border-blue-400/50 px-3 py-1.5 text-sm font-medium',
                  'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25'
                )}
                type='password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {errors.password && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.password}
              </span>
            )}
          </div>
          {/* Login button */}
          <div className="relative mb-4">
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
            >
              Sign In
            </Button>
          </div>
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