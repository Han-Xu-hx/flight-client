import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import countryList from 'country-list';
import http from '../services/http';
import { useAuth } from '../hooks/useAuth';
import { Field, Input, Label, Button, Combobox,ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

const RegisterUserPage = () => {
  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState('')

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

  const filteredCountries = 
    query === ''
        ? countries
        : countries.filter((c) => {
            return c.name.toLowerCase().includes(query.toLowerCase())
          })

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
            <Field>
              <Label
                id="username-label"
                className="block text-sm font-medium text-gray-700 mb-2 w-100">
                Username or email
              </Label>
              <Input
                id="username"
                value={userNameOrEmail}
                placeholder="Enter your username or email"
                onChange={(e) => setUserNameOrEmail(e.target.value)}
                className={clsx('mt-3 block w-95 rounded-lg border-1 border-blue-500 px-3 py-1.5 text-sm font-medium',
                                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25')}>
              </Input>
            </Field>
            {errors.userNameOrEmail && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.userNameOrEmail}
            </span>
            )}
          </div>
          <div className="relative mb-4">
            <Field>
              <Label
                id="password-label"
                className="block text-sm font-medium text-gray-700 mb-2 w-100">
                Confirm Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className={clsx('mt-3 block w-95 rounded-lg border-1 border-blue-500 px-3 py-1.5 text-sm font-medium',
                                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25')}>
              </Input>
            </Field>
            {errors.password && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.password}
            </span>
            )}
          </div>
          <div className="relative mb-4">
            <Field>
              <Label
                id="confirm-password-label"
                className="block text-sm font-medium text-gray-700 mb-2 w-100">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                placeholder="Enter your password again"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={clsx('mt-3 block w-95 rounded-lg border-1 border-blue-500 px-3 py-1.5 text-sm font-medium',
                                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25')}>
              </Input>
            </Field>
            {errors.confirmPassword && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.confirmPassword}
            </span>
            )}
          </div>
          <div className="relative mb-4">
            <Field>
              <Label
                id="first-name-label"
                className="block text-sm font-medium text-gray-700 mb-2 w-100">
                First Name
              </Label>
              <Input
                id="first-name"
                value={firstName}
                placeholder="Enter your first name"
                onChange={(e) => setFirstName(e.target.value)}
                className={clsx('mt-3 block w-95 rounded-lg border-1 border-blue-500 px-3 py-1.5 text-sm font-medium',
                                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25')}>
              </Input>
            </Field>
            {errors.firstName && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.firstName}
            </span>
            )}
          </div>

          <div className="relative mb-4">
            <Field>
              <Label
                id="last-name-label"
                className="block text-sm font-medium text-gray-700 mb-2 w-100">
                Last Name
              </Label>
              <Input
                id="last-name"
                value={lastName}
                placeholder="Enter your last name"
                onChange={(e) => setLastName(e.target.value)}
                className={clsx('mt-3 block w-95 rounded-lg border-1 border-blue-500 px-3 py-1.5 text-sm font-medium',
                                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25')}>
              </Input>
            </Field>
            {errors.lastName && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.lastName}
            </span>
            )}
          </div>

          <div className="relative mb-4">
            <Field>
              <Label
                id="country-label"
                className="block text-sm font-medium text-gray-700 mb-2 w-100">
                Country
              </Label>
              <Combobox
                value={country} onChange={(value) => {
                  setCountry(value);
                }} onClose={() => setQuery('')}>
                <div className="relative">
                  <ComboboxInput
                    className={clsx(
                      'w-full rounded-lg border-1 border-blue-500 py-1.5 pr-8 pl-3 text-sm text-black font-medium',
                      'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25'
                    )}
                    placeholder="Select a Country"
                    displayValue={(c) => c}
                    onChange={(event) => { 
                        setQuery(event.target.value);
                      }
                    }
                  />
                  <ComboboxButton className="absolute inset-y-0.5 right-0.5 px-0 w-0 !bg-white !border-none">
                    <ChevronDownIcon className="size-4 fill-blue-600" />
                  </ComboboxButton>
                </div>

                <ComboboxOptions
                  anchor="bottom"
                  transition
                  className={clsx(
                    'w-(--input-width) rounded-xl border border-blue-500 bg-white p-1 [--anchor-gap:--spacing(1)] empty:invisible',
                    'transition duration-100 ease-in data-leave:data-closed:opacity-0'
                  )}
                >
                  <ComboboxOption
                    value=""
                    className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none"
                  >
                    <CheckIcon className="invisible size-4 fill-black group-data-selected:visible" />
                    <div className="text-sm">Select a Country</div>
                  </ComboboxOption>
                  {filteredCountries.map((c) => (
                    <ComboboxOption
                      key={c.code}
                      value={c.name}
                      className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none"
                    >
                      <CheckIcon className="invisible size-4 fill-black group-data-selected:visible" />
                      <div className="text-sm">{c.name}</div>
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </Combobox>
            </Field>
            {errors.country && (
              <span className="text-red-500 text-sm mt-1 block">
                  {errors.country}
              </span>
            )}
          </div>

          <div className="relative mb-4">
          <Field>
              <Label
                id="phone-label"
                className="block text-sm font-medium text-gray-700 mb-2 w-100">
                Phone
              </Label>
              <Input
                id="phone"
                value={phone}
                placeholder="Enter your phone number"
                onChange={(e) => setPhone(e.target.value)}
                className={clsx('mt-3 block w-95 rounded-lg border-1 border-blue-500 px-3 py-1.5 text-sm font-medium',
                                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25')}>
              </Input>
            </Field>
            {errors.phone && (
            <span className="text-red-500 text-sm mt-1 block">
                {errors.phone}
            </span>
            )}
          </div>
          <div className="relative mb-4">
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
            >
              Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterUserPage;