import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';
import './componentsCSS/Navbar.css';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
    const { user } = useAuthContext();
    const { logout } = useLogout();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    const handleClick = () => {
        logout();
        setDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownOpen]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 850);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <header>
            <div className='navbar-container'>
                <div className="navbar-header">
                    <div className='name-and-logo'>
                        <Link to="/" className={`name-and-logo nav-item ${location.pathname === "/" ? "active" : ""}`}>
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                <path d="M253.813 14.47c-132.537 0-240.188 107.65-240.188 240.186 0 132.537 107.65 240.156 240.188 240.156C386.349 494.813 494 387.192 494 254.656S386.35 14.47 253.812 14.47zm0 18.686c122.436 0 221.5 99.064 221.5 221.5 0 17.96-2.133 35.412-6.157 52.125l-44.906-8.686-20.53-71.594-1.376-4.844-4.844-1.5-58.063-17.937-66.906-128.626-4.75-9.156-8.655 5.624-91.094 59.25-2.936 1.907-.97 3.374L116.19 301.97l-70.22 29.436c-8.82-23.91-13.656-49.753-13.656-76.75 0-122.436 99.064-221.5 221.5-221.5zm.812 62.125l-52.53 104.595 16.218 134.438 90.125-61.938v62.97l-23.563 6.25L305.72 470.03c-16.646 3.988-34.03 6.095-51.908 6.095-88.813 0-165.33-52.117-200.656-127.47l74.406-31.217 4.126-1.72 1.25-4.312 48.187-168.28 73.5-47.845z"></path>
                            </svg>
                            <h1>SLIDINĖJIMO ĮRANGOS NUOMA</h1>
                        </Link>
                    </div>

                    {user && (
                        <div className='nav-links-container' ref={dropdownRef}>
                            {isMobile ? (
                                <div className="dropdown">
                                    {dropdownOpen && (
                                        <div className="dropdown-menu">
                                            <p>{user.email}</p>
                                            <Link to="/" className='dropdown-item' onClick={toggleDropdown}>
                                                Visas įrangos sąrašas
                                            </Link>

                                            {user.role === 'admin' && (
                                                <>
                                                    <Link to="/create" className="dropdown-item" onClick={toggleDropdown}>
                                                        Pridėti naują įrangą
                                                    </Link>
                                                    <Link to="/update/:id" className="dropdown-item" onClick={toggleDropdown}>
                                                        Atnaujinti įrangos informaciją
                                                    </Link>
                                                    <Link to="/create" state={{ scrollToDrafts: true }} className="dropdown-item" onClick={toggleDropdown}>
                                                        Juodraštis
                                                    </Link>
                                                    <Link to="/ManageUsers" className="dropdown-item" onClick={toggleDropdown}>
                                                        Rezervacijos
                                                    </Link>
                                                </>
                                            )}

                                            {user.role === 'user' && (
                                                <Link to="/UserReservations" className="dropdown-item" onClick={toggleDropdown}>
                                                    Mano rezervacijos
                                                </Link>
                                            )}

                                            <button className="dropdown-item-logout-button" onClick={handleClick}>
                                                Atsijungti
                                            </button>
                                        </div>
                                    )}
                                    <button className='menu-button' onClick={toggleDropdown}>
                                        ☰ meniu
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <nav className="nav-links">
                                        <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
                                            Įrangos sąrašas
                                        </Link>

                                        {user.role === 'admin' && (
                                            <>
                                                <Link to="/create" className={`nav-item ${location.pathname === "/create" ? "active" : ""}`}>
                                                    Pridėti
                                                </Link>
                                                <Link to="/update/:id" className={`nav-item ${location.pathname === "/update/:id" ? "active" : ""}`}>
                                                    Atnaujinti
                                                </Link>
                                                <Link to="/create" state={{ scrollToDrafts: true }} className={`nav-item`}>
                                                    Juodraštis
                                                </Link>
                                                <Link to="/ManageUsers" className={`nav-item ${location.pathname === "/ManageUsers" ? "active" : ""}`}>
                                                    Rezervacijos
                                                </Link>
                                            </>
                                        )}
                                        {user.role === 'user' && (
                                            <Link to="/UserReservations" className={`nav-item ${location.pathname === "/UserReservations" ? "active" : ""}`}>
                                                Mano rezervacijos
                                            </Link>
                                        )}
                                    </nav>
                                    <Link to="/Login">
                                        <button className="logout-button" onClick={handleClick}>
                                            Atsijungti
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;