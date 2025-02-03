/* eslint-env jest */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IrangaDetails from '../IrangaDetails.jsx';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../hooks/useAuthContext', () => ({
    useAuthContext: jest.fn()
}));

jest.mock('../../hooks/useIrangaContext', () => ({
    useIrangaContext: jest.fn()
}));

import { useAuthContext } from '../../hooks/useAuthContext';
import { useIrangaContext } from '../../hooks/useIrangaContext';

global.fetch = jest.fn();

const mockDispatch = jest.fn();
const mockIranga = {
    _id: '123',
    title: 'Test Equipment',
    rentPricePerDay: 50,
    photos: ['test-photo.jpg']
};

const renderComponent = (user = null, iranga = mockIranga) => {
    useAuthContext.mockReturnValue({ user });
    const mockDispatchFn = jest.fn();
    useIrangaContext.mockReturnValue({ dispatch: mockDispatchFn });

    return render(
        <MemoryRouter>
            <IrangaDetails iranga={iranga} />
        </MemoryRouter>
    );
};

describe('IrangaDetails Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders equipment title', () => {
        renderComponent();
        expect(screen.getByText('Test Equipment')).toBeInTheDocument();
    });

    test('renders rent price', () => {
        renderComponent();
        expect(screen.getByText('50 €')).toBeInTheDocument();
    });

    test('renders equipment photo when available', () => {
        renderComponent();
        const image = document.getElementById('iranga-photo');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'test-photo.jpg');
    });

    test('renders photo placeholder when no photos are added', () => {
        const irangaWithoutPhoto = { ...mockIranga, photos: [] };
        renderComponent(null, irangaWithoutPhoto);
        const placeholder = document.getElementById('photo-placeholder');
        expect(placeholder).toBeInTheDocument();
    });

    test('shows delete icon for admin user', () => {
        const adminUser = { role: 'admin', token: 'test-token' };
        renderComponent(adminUser);
        expect(screen.getByLabelText('Delete equipment')).toBeInTheDocument();
    });

    test('hides delete icon for non-admin user', () => {
        const regularUser = { role: 'user', token: 'test-token' };
        renderComponent(regularUser);
        expect(screen.queryByLabelText('Delete equipment')).not.toBeInTheDocument();
    });

    test('handles delete action for admin', async () => {
        const adminUser = { role: 'admin', token: 'test-token' };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockIranga)
        });

        renderComponent(adminUser);

        const deleteIcon = screen.getByLabelText('Delete equipment');
        fireEvent.click(deleteIcon);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/iranga/123', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer test-token' }
            });
        });
    });

    test('prevents delete for unauthorized users', () => {
        const regularUser = { role: 'user', token: 'test-token' };
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        renderComponent(regularUser);

        expect(screen.queryByLabelText('Delete equipment')).not.toBeInTheDocument();

        consoleSpy.mockRestore();
    });

});