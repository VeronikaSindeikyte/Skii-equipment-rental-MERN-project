import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// pages and components
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuthContext } from './hooks/useAuthContext';
import IrangaForm from './components/AddIrangaForm';
import ChangeIrangaForm from './components/ChangeIrangaForm';
import IrangaInformation from './pages/IrangaInformation';
import UserReservations from './pages/UserReservations';
import ManageUsers from './pages/ManageUsers';
import ManageReservations from './pages/ManageReservations';
import RootLayout from './layouts/rootLayout';
import NotFound from './pages/NotFound';

function App() {
  const { user } = useAuthContext();

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
          <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/signup"
              element={!user ? <Signup /> : <Navigate to="/" />}
            />
            <Route path='/' element={<RootLayout />}>
            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/create"
              element={user?.role === 'admin' ? <IrangaForm /> : <Navigate to="/" />}
            />
            <Route
              path="/update/:id"
              element={user?.role === 'admin' ? <ChangeIrangaForm /> : <Navigate to="/" />}
            />
            <Route
              path='/iranga/:id'
              element={<IrangaInformation />}
            />
            <Route
              path='/UserReservations'
              element={<UserReservations />}
            />
            <Route
              path='/ManageUsers'
              element={<ManageUsers />}
            />
            <Route
              path='/ManageReservations/:id'
              element={<ManageReservations />}
            />
            </Route>

            <Route path='*' element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
