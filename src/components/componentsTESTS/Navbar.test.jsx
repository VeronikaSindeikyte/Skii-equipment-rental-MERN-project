import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar.jsx';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useLogout } from '../../hooks/useLogout';
import '@testing-library/jest-dom';


jest.mock('../../hooks/useAuthContext', () => ({
    useAuthContext: jest.fn()
}));

jest.mock('../../hooks/useLogout', () => ({
    useLogout: jest.fn()
}));



describe('Navbar Component', () => {
    const mockLogout = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (user = null) => {
        useAuthContext.mockReturnValue({ user });
        useLogout.mockReturnValue({ logout: mockLogout });

        return render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
    };

    test('renders logo and title', () => {
        renderComponent();
        expect(screen.getByText('SLIDINĖJIMO ĮRANGOS NUOMA')).toBeInTheDocument();
    });

    test('shows login and signup links when no user is logged in', () => {
        renderComponent(null);
        expect(screen.getByText('Prisijungti')).toBeInTheDocument();
        expect(screen.getByText('Registracija')).toBeInTheDocument();
    });

    test('shows account dropdown for logged-in user', () => {
        const user = { email: 'test@example.com', role: 'user' };
        renderComponent(user);

        const accountButton = screen.getByText(/Paskyra \(user\):/);
        fireEvent.click(accountButton);

        expect(screen.getByText(user.email)).toBeInTheDocument();
    });

    test('shows admin-specific links for admin user', () => {
        const adminUser = { email: 'admin@example.com', role: 'admin' };
        renderComponent(adminUser);

        const accountButton = screen.getByText(/Paskyra \(admin\):/);
        fireEvent.click(accountButton);

        expect(screen.getByText('Pridėti naują įrangą')).toBeInTheDocument();
        expect(screen.getByText('Atnaujinti įrangos informaciją')).toBeInTheDocument();
        expect(screen.getByText('Juodraštis')).toBeInTheDocument();
        expect(screen.getByText('Rezervacijos')).toBeInTheDocument();
    });

    test('shows user-specific links for regular user', () => {
        const user = { email: 'user@example.com', role: 'user' };
        renderComponent(user);

        const accountButton = screen.getByText(/Paskyra \(user\):/);
        fireEvent.click(accountButton);

        expect(screen.getByText('Mano rezervacijos')).toBeInTheDocument();
    });

    test('logout button calls logout function', () => {
        const user = { email: 'test@example.com', role: 'user' };
        renderComponent(user);

        const accountButton = screen.getByText(/Paskyra \(user\):/);
        fireEvent.click(accountButton);

        const logoutButton = screen.getByText('Atsijungti');
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalled();
    });

    test('dropdown closes after logout', () => {
        const user = { email: 'test@example.com', role: 'user' };
        renderComponent(user);

        const accountButton = screen.getByText(/Paskyra \(user\):/);
        fireEvent.click(accountButton);

        const logoutButton = screen.getByText('Atsijungti');
        fireEvent.click(logoutButton);
    });
});