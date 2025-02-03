/* eslint-env jest */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddIrangaForm from "../AddIrangaForm.jsx";
import { useIrangaContext } from "../../hooks/useIrangaContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import axios from "axios";
import { MemoryRouter } from 'react-router-dom';

jest.mock("../../hooks/useIrangaContext", () => ({
    useIrangaContext: jest.fn(),
}));

jest.mock("../../hooks/useAuthContext", () => ({
    useAuthContext: jest.fn(),
}));

jest.mock("axios");

beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'test-url');
});


describe("AddIrangaForm Component", () => {
    let mockDispatch;

    beforeEach(() => {
        mockDispatch = jest.fn();
        useIrangaContext.mockReturnValue({ dispatch: mockDispatch });
        useAuthContext.mockReturnValue({ user: { token: "test-token", role: "admin" } });
    });

    test("renders the form correctly", () => {
        render(
            <MemoryRouter>
                <AddIrangaForm />
            </MemoryRouter>
        );
        expect(screen.getByText("Pridėti naują įrangą")).toBeInTheDocument();
    });

    test("updates input fields correctly", () => {
        render(
            <MemoryRouter>
                <AddIrangaForm />
            </MemoryRouter>
        );
        const titleInput = screen.getByLabelText("Pavadinimas:");
        fireEvent.change(titleInput, { target: { value: "Test Title" } });
        expect(titleInput.value).toBe("Test Title");
    });

    test("shows error message when required fields are missing", async () => {
        render(
            <MemoryRouter>
                <AddIrangaForm />
            </MemoryRouter>
        );
        const submitButton = screen.getByText("Pridėti įrangą");
        fireEvent.click(submitButton);
        await waitFor(() => screen.getByText(/Prašome užpildyti visus laukelius/));
        expect(screen.getByText(/Prašome užpildyti visus laukelius/)).toBeInTheDocument();
    });

    test("submits form successfully", async () => {
        axios.post.mockResolvedValue({ data: { title: "Test Equipment" } });
        render(
            <MemoryRouter>
                <AddIrangaForm />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText("Pavadinimas:"), { target: { value: "Test Equipment" } });
        fireEvent.change(screen.getByLabelText("Aprašymas:"), { target: { value: "Test Description" } });
        fireEvent.change(screen.getByLabelText("Nuomos kaina vienai parai (EUR):"), { target: { value: "50" } });
        fireEvent.change(screen.getByLabelText("Dydis:"), { target: { value: "L" } });
        fireEvent.click(screen.getByText("Pridėti įrangą"));

        await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
        expect(mockDispatch).toHaveBeenCalledWith({ type: "CREATE_IRANGA", payload: { title: "Test Equipment" } });
    });

    test("handles image upload error", async () => {
        axios.post.mockRejectedValue({ response: { data: { error: "Upload failed" } } });
        render(
            <MemoryRouter>
                <AddIrangaForm />
            </MemoryRouter>
        );

        const fileInput = screen.getByLabelText("Nuotrauka:");
        fireEvent.change(fileInput, { target: { files: [new File(["test"], "test.jpg", { type: "image/jpeg" })] } });

        await waitFor(() => screen.getByText("Upload failed"));
        expect(screen.getByText("Upload failed")).toBeInTheDocument();
    });
});
