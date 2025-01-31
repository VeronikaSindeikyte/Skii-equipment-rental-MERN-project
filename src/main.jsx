import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IrangaContextProvider } from "./context/IrangaContextProvider";
import { AuthContextProvider } from './context/AuthContext';
import Footer from './components/Footer';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <IrangaContextProvider>
        <App />
        <Footer />
      </IrangaContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);