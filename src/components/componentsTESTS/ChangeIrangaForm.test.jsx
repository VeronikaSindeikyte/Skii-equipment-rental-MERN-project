/* eslint-env jest */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChangeIrangaForm from "../ChangeIrangaForm.jsx";
import { useIrangaContext } from "../../hooks/useIrangaContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { MemoryRouter } from 'react-router-dom';

jest.mock("../../hooks/useIrangaContext");
jest.mock("../../hooks/useAuthContext");

describe("ChangeIrangaForm Component", () => {
    let mockDispatch;
    const mockIrangos = [
        { 
            _id: "1", 
            title: "Test Equipment",
            description: "Test Description",
            rentPricePerDay: 50,
            gender: "unisex",
            size: "M",
            condition: "new",
            available: true
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockDispatch = jest.fn();
        useIrangaContext.mockReturnValue({
            irangos: mockIrangos,
            dispatch: mockDispatch,
        });
        useAuthContext.mockReturnValue({
            user: { token: "test-token", role: "admin" },
        });

        global.fetch = jest.fn();
        
        global.URL.createObjectURL = jest.fn(() => 'test-url');
    });

    test("renders the form correctly for admin users", () => {
        render(
            <MemoryRouter>
                <ChangeIrangaForm />
            </MemoryRouter>
        );
        expect(screen.getByText("Atnaujinti įrangos informaciją:")).toBeInTheDocument();
        expect(screen.getByLabelText("Pasirinkti įrangą:")).toBeInTheDocument();
    });

    test("updates form fields when equipment is selected", async () => {
        render(
            <MemoryRouter>
                <ChangeIrangaForm />
            </MemoryRouter>
        );

        const selectInput = screen.getByLabelText("Pasirinkti įrangą:");
        fireEvent.change(selectInput, { target: { value: "1" } });

        await waitFor(() => {
            expect(screen.getByLabelText("Pavadinimas:").value).toBe("Test Equipment");
            expect(screen.getByLabelText("Aprašymas:").value).toBe("Test Description");
            expect(screen.getByLabelText("Nuomos kaina per dieną (EUR):").value).toBe("50");
        });
    });

    test("successfully submits form with updated data", async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    ...mockIrangos[0],
                    title: "Updated Equipment",
                    description: "Updated Description"
                })
            })
        );

        render(
            <MemoryRouter>
                <ChangeIrangaForm />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText("Pasirinkti įrangą:"), {
            target: { value: "1" },
        });

        await waitFor(() => screen.getByLabelText("Pavadinimas:"));

        fireEvent.change(screen.getByLabelText("Pavadinimas:"), {
            target: { value: "Updated Equipment" },
        });
        fireEvent.change(screen.getByLabelText("Aprašymas:"), {
            target: { value: "Updated Description" },
        });

        const submitButton = screen.getByRole('button', { name: /Atnaujinti įrangą/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/iranga/1',
                expect.objectContaining({
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token'
                    }
                })
            );
            expect(mockDispatch).toHaveBeenCalledTimes(1);
        });
    });

    test("handles update error correctly", async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ error: "Nepavyko atnaujinti įrangos." })
            })
        );

        render(
            <MemoryRouter>
                <ChangeIrangaForm />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText("Pasirinkti įrangą:"), { 
            target: { value: "1" } 
        });

        await waitFor(() => screen.getByLabelText("Pavadinimas:"));
        
        fireEvent.click(screen.getByText("Atnaujinti įrangą"));

        await waitFor(() => {
            expect(screen.getByText("Nepavyko atnaujinti įrangos.")).toBeInTheDocument();
        });
    });

    test("restricts access for non-admin users", () => {
        useAuthContext.mockReturnValue({ user: { role: "user" } });

        render(
            <MemoryRouter>
                <ChangeIrangaForm />
            </MemoryRouter>
        );
        
        expect(screen.getByText("Prieiga negalima. Tik administratoriai gali redaguoti įrangą.")).toBeInTheDocument();
    });

    test("handles unauthenticated users", () => {
        useAuthContext.mockReturnValue({ user: null });

        render(
            <MemoryRouter>
                <ChangeIrangaForm />
            </MemoryRouter>
        );
        
        expect(screen.getByText("Prieiga negalima. Tik administratoriai gali redaguoti įrangą.")).toBeInTheDocument();
    });
});