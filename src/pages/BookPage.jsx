import { useState, useEffect } from 'react';
import HeaderPage from './HeaderPage';
//import { useLocation } from 'react-router-dom';
import http from '../services/http';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { Fragment } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Field, Input, Label, Button } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

function BookPage() {
  const [passengers, setPassengers] = useState([]);
  const [flightInfo, setFlightInfo] = useState({})
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPassenger, setCurrentPassenger] = useState(null);
  const [newPassenger, setNewPassenger] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (sessionStorage.getItem('flightInfos')) {
      try {
        const flightData = JSON.parse(sessionStorage.getItem('flightInfos'));
        setFlightInfo(flightData);
        console.log('Flight info from session storage:', flightData);
        console.log('Flight info:', flightData.id);
      } catch (error) {
        console.error('Error parsing flight data from session storage:', error);
      }
    } else {
      toast.error('You need comeback to home page to search for a flight.');
      navigate('/');
    }
    sessionStorage.removeItem('fromUrl');
    sessionStorage.setItem('fromUrl', '/book');
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleBooking = async(e) => {
    e.preventDefault();

    if (passengers.length === 0) {
      toast.error('Please add at least one passenger.');
      return;
    }

    if (passengers.length > 5) {
      toast.error('You can only book up to 5 passengers.');
      return;
    }

    const uId = JSON.parse(localStorage.getItem('user_info')).id;
    const bookingData = {
      reference: Date.now().toString(),
      booking: flightInfo,
      passengers: passengers,
      userId: uId
    };
    console.log('Search params:', bookingData);
    try {
      const response = await http.post('/book/booking', bookingData);
      if (response.status === 200) {
        toast.success('Booking successful!');
        sessionStorage.removeItem('fromUrl');
        sessionStorage.removeItem('flightInfos');
        navigate('/');
      }
    } catch (error) {
      console.log(error);
      console.error('Error booking flight:', error);
      toast.error(`Searched failed: ${error.message}`);
    } finally {
      console.log('Search params:', bookingData);
    }

  };

  const handleRemovePassenger = (passengerId) => {
    setPassengers(passengers.filter(passenger => passenger.tmpId !== passengerId));
  };

  const handleEditPassenger = (passenger) => {
    setCurrentPassenger(passenger);
    setNewPassenger({
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      email: passenger.email
    });
    setEditMode(true);
    setIsOpen(true);
  };

  const handleUpdatePassenger = () => {
    setPassengers(passengers.map(passenger => 
      passenger.tmpId === currentPassenger.tmpId 
        ? { ...newPassenger, tmpId: currentPassenger.tmpId } 
        : passenger
    ));
    setNewPassenger({ firstName: '', lastName: '', email: '' });
    setIsOpen(false);
    setEditMode(false);
    setCurrentPassenger(null);
  };

  const handleAddPassenger = () => {

    if (newPassenger.firstName === '' || newPassenger.lastName === '' || newPassenger.email === '') {
      toast.error('Please fill in all fields.');
      return;
    }

    if (editMode) {
      handleUpdatePassenger();
    } else {
      setPassengers([...passengers, {
        ...newPassenger,
        tmpId: Date.now()
      }]);
      setNewPassenger({ firstName: '', lastName: '', email: '' });
      setIsOpen(false);
    }
  };

  // 在return中添加以下代码
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPage />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Flight Book Details</h2>
          <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Cabin Class Dropdown */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Flight No.</label>
              <div className="text-sm text-gray-500 mt-1">{flightInfo.airline} {flightInfo.flightNo}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
              <div className="text-sm text-gray-500 mt-1">{flightInfo.departure}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <div className="text-sm text-gray-500 mt-1">{flightInfo.arrival}</div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Airline information</label>
              <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-30">departure airport:</span>{flightInfo.departureAirport}</div>
              <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-30">departure date:</span>{flightInfo.date} {flightInfo.time}</div>
              <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-30">arrival airport:</span>{flightInfo.arrivalAirport}</div>
              <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-30">arrival date:</span>{flightInfo.arrivalDate} {flightInfo.arrivalTime}</div>
              <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-30">duration:</span>{flightInfo.duration}</div>
              <div className="text-sm text-gray-500 mt-1"><span className="inline-block w-30">price:</span>¥{flightInfo.price}/person</div>
            </div>
            
            <div className="items-end">
              <Button
                type="submit"
                className="bg-gradient-to-r h-9 from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center"
              >
                Booking Flight
              </Button>
            </div>
          </form>
        </div>
      </div>
    {/* Passenger List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Passengers</h3>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r h-9 from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center"
          >
            Add Passenger
          </Button>
        </div>

        {/* Passenger List Items */}
        {passengers.length > 0 ? (
          passengers.map(passenger => (
            <div key={passenger.tmpId} className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p>{passenger.firstName} {passenger.lastName}</p>
                  <p className="text-sm text-gray-500">{passenger.email}</p>
                </div>
                <div className="flex space-x-2">
                <Button 
                  onClick={() => handleEditPassenger(passenger)}
                  className="bg-gradient-to-r h-9 from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold 
                            hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center"
                >
                  Edit
                </Button>
                <Button className="bg-gradient-to-r h-9 from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center"
                      onClick={() => handleRemovePassenger(passenger.tmpId)}>
                  Remove
                </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No passengers added yet
          </div>
        )}
      </div>

      {/* Add Passenger Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {editMode ? 'Edit Passenger' : 'Add New Passenger'}
                  </DialogTitle>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Field>
                        <Label className="block text-sm font-medium text-gray-700">First Name</Label>
                        <Input
                          type="text"
                          className={clsx(
                            'mt-3 block w-full rounded-lg border-1 border-blue-400/50 px-3 py-1.5 text-sm font-medium',
                            'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25'
                          )}
                          value={newPassenger.firstName}
                          onChange={(e) => setNewPassenger({...newPassenger, firstName: e.target.value})}
                        />
                      </Field>
                    </div>
                    <div>
                      <Field>
                        <Label className="block text-sm font-medium text-gray-700">Last Name</Label>
                        <Input
                          type="text"
                          className={clsx(
                            'mt-3 block w-full rounded-lg border-1 border-blue-400/50 px-3 py-1.5 text-sm font-medium',
                            'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25'
                          )}
                          value={newPassenger.lastName}
                          onChange={(e) => setNewPassenger({...newPassenger, lastName: e.target.value})}
                        />
                      </Field>
                    </div>
                    <div>
                      <Field>
                        <Label className="block text-sm font-medium text-gray-700">Email</Label>
                        <Input
                          type="email"
                          className={clsx(
                            'mt-3 block w-full rounded-lg border-1 border-blue-400/50 px-3 py-1.5 text-sm font-medium',
                            'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-600/25'
                          )}
                          value={newPassenger.email}
                          onChange={(e) => setNewPassenger({...newPassenger, email: e.target.value})}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      type="button"
                      className="bg-gradient-to-r h-9 from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="bg-gradient-to-r h-9 from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                      hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center"
                      onClick={handleAddPassenger}
                    >
                      {editMode ? 'Modify Passenger' : 'Add Passenger'}
                    </Button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
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

export default BookPage;