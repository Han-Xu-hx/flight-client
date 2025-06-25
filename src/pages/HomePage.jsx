import { useEffect, useState } from 'react';
import HeaderPage from './HeaderPage';
//import { useLocation } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from '../services/http';
import { Field, Input, Label, Button, Combobox,ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Select } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

function HomePage() {
  const [flights, setFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [tripType, setTripType] = useState('one-way'); // 'one-way' or 'round-trip'
  const [cabinClass, setCabinClass] = useState('economy'); // 'economy', 'business', 'first'
  const [airports, setAirports] = useState([]);
  const [activeTab, setActiveTab] = useState('departure');
  const [query, setQuery] = useState('');
  const filteredAirPorts = 
  query === ''
      ? airports
      : airports.filter((c) => {
          return c.city.toLowerCase().includes(query.toLowerCase())
        });

  const [searchParams, setSearchParams] = useState({
    departure: '',
    arrival: '',
    date: '',
    returnDate: '', // Only used for round-trip
    cabinClass: 'economy',
    tripType: 'one-way',
    passengers: 1
  });

  // For error handling
  const [errors, setErrors] = useState({
    departureError: '',
    arrivalError: '',
    dateError: '',
    returnDateError: '',
    serverError: ''
  });

  const navigate = useNavigate();
  useEffect(() => {

    async function fetchAirports() {
      const response = await http.get('/common/airports');
      return response.data?.data?.airports;
    }

    fetchAirports().then(aps => {
      setAirports(getUniqueCities(aps));
    });

    if (sessionStorage.getItem('homePage')) {
      const pageInfo = JSON.parse(sessionStorage.getItem('homePage'));
      setActiveTab(pageInfo.activeTab);
      setSearchParams(pageInfo.searchParams);
      setTripType(pageInfo.tripType);
      setCabinClass(pageInfo.cabinClass);
      setFlights(pageInfo.flights);
      setReturnFlights(pageInfo.returnFlights);
    }
  }, [])

  const [isLoading, setIsLoading] = useState(false);
  const handleSearch = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // validation errors
    const newErrors = {};

    if (!searchParams.departure) {
      newErrors.departureError = 'Please select departure city';
    }
    if (!searchParams.arrival) {
      newErrors.arrivalError = 'Please select destination city';
    }
    if (!searchParams.date) {
      newErrors.dateError = 'Please select departure date';
    }
    if (tripType === 'round-trip' && !searchParams.returnDate) {
      newErrors.returnDateError = 'Please select return date';
    }

    if (tripType === 'round-trip' && searchParams.returnDate <= searchParams.date) {
      newErrors.returnDateError = 'Return date must be after departure date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFlights([]);
      setReturnFlights([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await http.post('/common/flights-search', searchParams);
      if (response.status === 200) {
        toast.success('Flights search completed successfully');
        if (response.data?.data) {
          setFlights(response.data.data.flights || []);
          setReturnFlights(response.data.data.returnFlights || []); // set return flights if round-trip
        }
        sessionStorage.removeItem('homePage');
        sessionStorage.setItem('homePage', JSON.stringify({
          activeTab: activeTab,
          searchParams: searchParams,
          tripType: tripType,
          cabinClass: cabinClass,
          flights: response.data.data.flights,
          returnFlights: response.data.data.returnFlights
        }));
      }
    } catch (error) {
      toast.error(`Searched failed: ${error.message}`);
      setErrors({ serverError: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = (flight) => {
    sessionStorage.setItem('flightInfos', JSON.stringify(flight));
    sessionStorage.setItem('fromUrl', '/');
    navigate('/book');
  };

  const getUniqueCities = (airports) => {
    return airports.filter((airport, index, self) =>
      index === self.findIndex(a => a.city === airport.city)
    );
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPage />

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Flights</h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Trip Type Radio Buttons */}
            <div className="md:col-span-4 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  checked={tripType === 'one-way'}
                  onChange={() => {
                    setTripType('one-way');
                    setSearchParams({ ...searchParams, tripType: 'one-way', returnDate: '' });
                  }}
                />
                <span className="ml-2 font-medium">One Way</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  checked={tripType === 'round-trip'}
                  onChange={() => {
                    setTripType('round-trip');
                    setSearchParams({ ...searchParams, tripType: 'round-trip' });
                  }}
                />
                <span className="ml-2 font-medium">Round Trip</span>
              </label>
            </div>

            {/* Cabin Class Dropdown */}
            <div>
              <Field> 
                <Label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</Label>
                <div className="relative">
                <Select
                  className={clsx(
                    'w-full rounded-lg border-1 appearance-none border-blue-500 py-1.5 pr-8 pl-3 text-sm text-black font-medium',
                    'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25')}
                  value={cabinClass}
                  onChange={(e) => {
                    setCabinClass(e.target.value);
                    setSearchParams({ ...searchParams, cabinClass: e.target.value });
                  }}
                >
                  <option value="economy">Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                  
                </Select>
                <ChevronDownIcon className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-blue-600" aria-hidden="true" />
                </div>
              </Field>
            </div>

            <div>
              <Field>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Departure</Label>
                <Combobox value={searchParams.departure} onChange={(value) => setSearchParams({ ...searchParams, departure: value })} onClose={() => setQuery('')}>
                  <div className="relative">
                    <ComboboxInput
                      className={clsx(
                        'w-full rounded-lg border-1 border-blue-500 py-1.5 pr-8 pl-3 text-sm text-black font-medium',
                        'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25'
                      )}
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
                      <div className="text-sm">Select Departure</div>
                    </ComboboxOption>
                    {filteredAirPorts.map((c) => (
                      <ComboboxOption
                        key={c.airportId}
                        value={c.city}
                        className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none"
                      >
                        <CheckIcon className="invisible size-4 fill-black group-data-selected:visible" />
                        <div className="text-sm">{c.city}</div>
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                </Combobox>
              </Field>
              {errors.departureError && (
                <p className="mt-1 text-sm text-red-600">{errors.departureError}</p>
              )}
            </div>

            <div>
              <Field>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Destination</Label>
                <Combobox value={searchParams.arrival} onChange={(value) => setSearchParams({ ...searchParams, arrival: value })} onClose={() => setQuery('')}>
                  <div className="relative">
                    <ComboboxInput
                      className={clsx(
                        'w-full rounded-lg border-1 border-blue-500 py-1.5 pr-8 pl-3 text-sm text-black font-medium',
                        'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25'
                      )}
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
                      <div className="text-sm">Select Destination</div>
                    </ComboboxOption>
                    {filteredAirPorts.map((c) => (
                      <ComboboxOption
                        key={c.airportId}
                        value={c.city}
                        className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none"
                      >
                        <CheckIcon className="invisible size-4 fill-black group-data-selected:visible" />
                        <div className="text-sm">{c.city}</div>
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                </Combobox>
              </Field>
              {errors.arrivalError && (
                <p className="mt-1 text-sm text-red-600">{errors.arrivalError}</p>
              )}
            </div>
            <div>
              <Field>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Number of passengers</Label>
                <div className="relative">
                <Select
                  className={clsx(
                    'w-full rounded-lg border-1 appearance-none border-blue-500 py-1.5 pr-8 pl-3 text-sm text-black font-medium',
                    'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25')}
                  value={searchParams.passengers}
                  onChange={(e) => {
                    setSearchParams({ ...searchParams, passengers: e.target.value });
                  }}
                >
                  {
                    [1, 2, 3, 4, 5].map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))
                  }
                </Select>
                <ChevronDownIcon className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-blue-600" aria-hidden="true" />
                </div>
              </Field>
            </div>
            <div>
              <Field>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Date</Label>
                <Input
                  type="date"
                  className={clsx(
                    'w-full rounded-lg border-1 appearance-none border-blue-500 py-1.5 pr-8 pl-3 text-sm text-black font-medium',
                    'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25' )}
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                />
              </Field>
              {errors.dateError && (
                <p className="mt-1 text-sm text-red-600">{errors.dateError}</p>
              )}
            </div>
            {/* Add return date if round-trip */}
            {tripType === 'round-trip' && (
              <div>
                <Field>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Return Date</Label>
                  <Input
                    type="date"
                    className={clsx(
                    'w-full rounded-lg border-1 appearance-none border-blue-500 py-1.5 pr-8 pl-3 text-sm text-black font-medium',
                    'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25' )}
                    value={searchParams.returnDate || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                  />
                </Field>
                {errors.returnDateError && (
                  <p className="mt-1 text-sm text-red-600">{errors.returnDateError}</p>
                )}
              </div>
            )}
            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full h-9 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center"
              >
                Search Flights
              </Button>
            </div>
          </form>
        </div>

        {/* Flight List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <Button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'departure' ? 'border-blue-500 text-white !bg-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('departure')}
              >
                Departure Flights
              </Button>
              {tripType === 'round-trip' && (
                <Button
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'return' ? 'border-blue-500 text-white !bg-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  onClick={() => setActiveTab('return')}
                >
                  Return Flights
                </Button>
              )}
            </nav>
          </div>
          <div className="p-6">
            {
              isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between mb-4">
                        <Skeleton width={150} height={24} />
                        <Skeleton width={100} height={24} />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <Skeleton height={16} />
                        <Skeleton height={16} />
                        <Skeleton height={16} />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <Skeleton width={200} height={16} />
                          <Skeleton width={200} height={16} />
                          <Skeleton width={200} height={16} />
                        </div>
                        <Skeleton width={100} height={40} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
            {!isLoading && (
              activeTab === 'departure' ? (
                <div className="divide-y divide-gray-200">
                  {flights.length > 0 ? (
                    flights.map(flight => (
                      <div key={flight.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="mb-4 md:mb-0">
                              <img src="../assets/airlines/cn.png" alt={flight.airline} width="32" height="32" />
                              <h3 className="text-lg font-semibold text-gray-800">{flight.airline} {flight.flightNo}</h3>
                            <div className="flex items-center mt-2">
                              <span className="text-gray-600">{flight.departure}</span>
                              <span className="mx-2 text-gray-400">→</span>
                              <span className="text-gray-600">{flight.arrival}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-20">departure:</span>{flight.date} {flight.time}</div>
                            <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-20">arrival:</span>{flight.arrivalDate} {flight.arrivalTime}</div>
                            <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-20">duration:</span>{flight.duration}</div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-blue-600 mr-6">¥{flight.price}</span>
                            <Button
                              onClick={() => handleBook(flight)}
                              className="bg-gradient-to-r h-9 from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                            hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center"
                            >
                              Book
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No departure flights found.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {returnFlights.length > 0 ? (
                    returnFlights.map(flight => (
                      <div key={flight.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="mb-4 md:mb-0">
                            <h3 className="text-lg font-semibold text-gray-800">{flight.airline} {flight.flightNo}</h3>
                            <div className="flex items-center mt-2">
                              <span className="text-gray-600">{flight.departure}</span>
                              <span className="mx-2 text-gray-400">→</span>
                              <span className="text-gray-600">{flight.arrival}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-20">departure:</span>{flight.date} {flight.time}</div>
                            <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-20">arrival:</span>{flight.arrivalDate} {flight.arrivalTime}</div>
                            <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-20">duration:</span>{flight.duration}</div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-blue-600 mr-6">¥{flight.price}</span>
                            <Button
                              onClick={() => handleBook(flight)}
                              className="bg-gradient-to-r from-blue-500 h-9 to-purple-600 text-white py-3 rounded-lg font-semibold 
                          hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center"
                            >
                              Book
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No return flights found.</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default HomePage;