import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import countryList from 'country-list';
import http from '../services/http';
import { useAuth } from '../hooks/useAuth';

const RegisterUserPage = () => {
  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');


  // For error handling
  const [errors, setErrors] = useState({
    userNameOrEmail: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    serverError: ''
  });

  const countries = countryList.getData().sort((a, b) => a.name.localeCompare(b.name));

  const navigate = useNavigate();
  const { setAuthState, isAuthenticated } = useAuth();
  useEffect(() => {

    // If user is already authenticated, redirect to home page
    if (isAuthenticated) {
      navigate('/');
    } 
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    
    console.log('Registering user...');
    // validation errors
    const newErrors = {};

    if (!userNameOrEmail) {
      newErrors.userNameOrEmail = 'Username or email is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userNameOrEmail)) {
      newErrors.userNameOrEmail = 'Invalid email format';
    }

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain at least one letter and one number';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!country) {
      newErrors.country = 'Country is required'; 
    }

    if (phone && !/^\+?[0-9\s\-()]{6,}$/.test(phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log('Registering user in here...');
    try {
        const response = await http.post('/auth/register', {
            email: userNameOrEmail,
            password: password,
            firstName: firstName,
            lastName: lastName,
            country: country,
            phone: phone,
        });
        console.log(response.data);
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
          || 'Registration failed';

      if (error.response?.status === 400) {
          if (error.response?.data?.data?.errors) {
              setErrors(prev => ({
                  ...prev,
                  ...error.response.data.data.errors,
                  serverError: error.response.data.data.errors.email
              }));
          } else {
              setErrors(prev => ({...prev, serverError: errorMessage }));
          }
      } else {
          setErrors(prev => ({...prev, serverError: errorMessage }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div>
            <span className="icon-lock text-white text-2xl" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8 mt-4">
          Register User
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
                style={{ height:48 }}
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
                style={{ height: 48 }}
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
          <div className="relative mb-4">
                <label
                  id="confirm-password-label" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
            <div className="relative">
              <input
                id="confirm-password"
                type="password"
                placeholder="Enter your password again"
                className="w-full pl-5 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-all"
                style={{ height: 48 }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            {errors.confirmPassword && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.confirmPassword}
            </span>
            )}
            </div>
          </div>
          <div className="relative mb-4">
                <label
                  id="first-name-label"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
            <div className="relative">
              <input
                id="first-name"
                type="text"
                placeholder="Enter your first name"
                className="w-full pl-5 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-all"
                style={{ height:48 }}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            {errors.firstName && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.firstName}
            </span>
            )}
            </div>
          </div>

          <div className="relative mb-4">
                <label
                  id="last-name-label"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
            <div className="relative">
              <input
                id="last-name"
                type="text"
                placeholder="Enter your first name"
                className="w-full pl-5 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-all"
                style={{ height:48 }}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            {errors.lastName && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.lastName}
            </span>
            )}
            </div>
          </div>

          <div className="relative mb-4">
                <label
                  id="country-label"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Country
                </label>
            <div className="relative">
              <select
                id="country"
                className="w-full pl-5 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-all"
                style={{ height:48 }}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select your country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            {errors.country && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.country}
            </span>
            )}
            </div>
          </div>

          <div className="relative mb-4">
                <label
                  id="phone-label"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone
                </label>
            <div className="relative">
              <input
                id="phone"
                type="text"
                placeholder="Enter your phone number"
                className="w-full pl-5 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-all"
                style={{ height:48 }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {errors.phone && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.phone}
            </span>
            )}
          </div>

          {/* 登录按钮 */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                     hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterUserPage;