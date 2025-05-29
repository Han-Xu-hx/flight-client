import { useState, useEffect } from 'react';
import HeaderPage from './HeaderPage';
import { useLocation } from 'react-router-dom';
import http from '../services/http';


function HomePage() {
  const [flights, setFlights] = useState([
    { id: 1, airline: 'Air China', flightNo: 'CA123', departure: 'Beijing', arrival: 'Shanghai', date: '2023-12-25', time: '08:00', price: 1200 },
    { id: 2, airline: 'China Eastern', flightNo: 'MU456', departure: 'Shanghai', arrival: 'Guangzhou', date: '2023-12-26', time: '10:30', price: 980 },
    { id: 3, airline: 'China Southern', flightNo: 'CZ789', departure: 'Guangzhou', arrival: 'Chengdu', date: '2023-12-27', time: '14:15', price: 850 }
  ]);
  const [tripType, setTripType] = useState('one-way'); // 'one-way' or 'round-trip'
  const [cabinClass, setCabinClass] = useState('economy'); // 'economy', 'business', 'first'

  const [searchParams, setSearchParams] = useState({
    departure: '',
    arrival: '',
    date: ''
  });

  const airPortList = {}

  useEffect(() => {

    async function fetchAirports() {
      const response = await http.get('/common/airports');
      return response.data?.airports;
    }

    fetchAirports().then(airports => {
      airports.forEach(airport => {
        console.log(airport);
      })
    });
    
  },[])

  const handleSearch = (e) => {
    e.preventDefault();
    // 这里应该调用API搜索航班
    console.log('搜索参数:', searchParams);
  };

  const handleBook = (flightId) => {
    // 这里应该处理预订逻辑
    console.log('预订航班ID:', flightId);
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
                  onChange={() => setTripType('one-way')}
                />
                <span className="ml-2">One Way</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  checked={tripType === 'round-trip'}
                  onChange={() => setTripType('round-trip')}
                />
                <span className="ml-2">Round Trip</span>
              </label>
            </div>

            {/* Cabin Class Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchParams.departure}
                onChange={(e) => setSearchParams({...searchParams, departure: e.target.value})}
                placeholder="e.g. Beijing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchParams.arrival}
                onChange={(e) => setSearchParams({...searchParams, arrival: e.target.value})}
                placeholder="e.g. Shanghai"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchParams.date}
                onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
              >
                Search Flights
              </button>
            </div>
            {/* Add return date if round-trip */}
            {tripType === 'round-trip' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchParams.returnDate || ''}
                  onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
                />
              </div>
            )}
          </form>
        </div>

        {/* Flight List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-2xl font-bold text-gray-800 p-6">Available Flights</h2>
          <div className="divide-y divide-gray-200">
            {flights.map(flight => (
              <div key={flight.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-semibold text-gray-800">{flight.airline} {flight.flightNo}</h3>
                    <div className="flex items-center mt-2">
                      <span className="text-gray-600">{flight.departure}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="text-gray-600">{flight.arrival}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{flight.date} {flight.time}</div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-blue-600 mr-6">¥{flight.price}</span>
                    <button
                      onClick={() => handleBook(flight.id)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;