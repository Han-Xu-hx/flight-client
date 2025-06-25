import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MyBookingsPage from './pages/MyBookingsPage'
import RegisterUserPage from './pages/RegisterUserPage'
import BookPage from './pages/BookPage'

function App() {

  return (
    <div className="w-full mx-auto">
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/my-bookings" element={<MyBookingsPage />}></Route>
        <Route path="/register" element={<RegisterUserPage />}></Route>
        <Route path="/book" element={<BookPage />}></Route>
      </Routes>
    </div>
  )
}

export default App;
