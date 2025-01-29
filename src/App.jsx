import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'

// pages and components
import Home from './pages/Home'
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuthContext } from './hooks/useAuthContext';
import IrangaForm from './components/AddIrangaForm';
import ChangeIrangaForm from './components/ChangeIrangaForm';
import IrangaInformation from './pages/IrangaInformation';

function App() {
  const { user } = useAuthContext();

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/signup"
              element={!user ? <Signup /> : <Navigate to="/" />}
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
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
