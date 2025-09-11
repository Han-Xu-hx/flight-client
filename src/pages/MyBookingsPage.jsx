import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from '../services/http';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import HeaderPage from './HeaderPage';


function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const hasFetched = useRef(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.removeItem('fromUrl');
      sessionStorage.setItem('fromUrl', '/my-bookings');
      navigate('/login');
      return;
    }

    if (hasFetched.current) {
      return; 
    }
    hasFetched.current = true;

    const fetchBookings = async () => {
      try {
        const uId = JSON.parse(localStorage.getItem('user_info')).id;
        const response = await http.post('/book/my-bookings', {
          userId: uId
        });
        if (response.status === 200) {
          console.log(response.data);
          if (Array.isArray(response.data.data?.bookings)) {
            setBookings(response.data?.data?.bookings || []);
          }
        }
      } catch (error) {
          toast.error(`Failed to fetch bookings ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [isAuthenticated, navigate]);

  const columns = [
    {
      title: 'Booking Ref',
      dataIndex: ['reference'],
      key: 'reference',
    },
    {
      title: 'Flight No',
      dataIndex: ['flightNumber'],
      key: 'flightNumber',
    },
    {
      title: 'Departure',
      dataIndex: ['departureAirport'],
      key: 'departure',
    },
    {
      title: 'Destination',
      dataIndex: ['destinationAirport'],
      key: 'destination',
    },
    {
      title: 'Departure Time',
      dataIndex: ['departureDate', 'departureTime'],
      key: 'departureDate'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice'
    },
    {
      title: 'Actions',
      dataIndex: 'totalPrice',
      key: 'actions'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
    <HeaderPage />
    <div style={{ padding: '24px' }}>
      <div className="h-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h2>
      </div>
      {loading ? (
          <div className="space-y-4">
            <div className="flex justify-between mb-4">
              {columns.map((col, i) => (
                <Skeleton key={`header-${i}`} width={100} height={30} />
              ))}
            </div>
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex justify-between mb-4">
                {columns.map((col, colIndex) => (
                  <Skeleton 
                    key={`row-${rowIndex}-col-${colIndex}`} 
                    width={colIndex === 0 ? 120 : 100} 
                    height={20} 
                  />
                ))}
              </div>
            ))}
          </div>
      ) : (
        bookings.length > 0 ? (
              <div className="space-y-4">
              <div className="grid grid-cols-8 gap-4 font-semibold bg-gray-200 p-4 rounded-md">
                {columns.map(col => (
                  <div key={col.key}>{col.title}</div>
                ))}
              </div>
              {bookings.map(booking => (
                <div key={booking.bookingId} className="grid grid-cols-8 gap-4 items-center">
                  <div className="pl-3">{booking.reference}</div>
                  <div>{booking.flightNumber}</div>
                  <div>{booking.departureAirport}</div>
                  <div>{booking.arrivalAirport}</div>
                  <div>{booking.departureDate} {booking.departureTime}</div>
                  <div>{booking.status}</div>
                  <div>¥{booking.totalPrice}</div>
                  <div>
                    <button 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                              hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No bookings found</p>
          <button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
                          hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
            onClick={() => navigate('/')}
          >
            Book a Flight
          </button>
        </div>
        )
      )}
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
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Booking Details</h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Booking Reference:</p>
                <p className="font-medium">{selectedBooking?.reference}</p>
              </div>
              <div>
                <p className="text-gray-600">Flight Number:</p>
                <p className="font-medium">{selectedBooking?.flightNumber}</p>
              </div>
            </div>
            
            {/*  */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Departure:</p>
                <p className="font-medium">{selectedBooking?.departureAirport}</p>
              </div>
              <div>
                <p className="text-gray-600">Destination:</p>
                <p className="font-medium">{selectedBooking?.arrivalAirport}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Departure Date:</p>
                <p className="font-medium">{selectedBooking?.departureDate} {selectedBooking?.departureTime}</p>
              </div>
              <div>
                <p className="text-gray-600">Arrival Date:</p>
                <p className="font-medium">{selectedBooking?.arrivalDate} {selectedBooking?.arrivalTime}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-gray-600">Duration:</p>
                <p className="font-medium">{selectedBooking?.duration}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="text-l font-bold">Passengers</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded-md">
              <div>
                <p className="text-gray-600">Passenger Name</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
              </div>
            </div>
            {
              selectedBooking?.passengers.map(p1 => (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium pl-5">{p1.firstName}, {p1.lastName}</p>
                  </div>
                  <div>
                    <p className="font-medium">{p1.email}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default MyBookingsPage;