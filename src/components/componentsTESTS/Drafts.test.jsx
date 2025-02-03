/* eslint-env jest */
import React from 'react';
import { within } from '@testing-library/dom';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Drafts from '../Drafts';

describe('Drafts Component', () => {
    const mockOnDelete = jest.fn();
    const mockOnEdit = jest.fn();

    const sampleDrafts = [
        {
            title: "Test Equipment 1",
            description: "Test Description 1",
            rentPricePerDay: 50,
            photos: ["test-photo-url-1"]
        },
        {
            title: "Test Equipment 2",
            description: "Test Description 2",
            rentPricePerDay: 75,
            photos: []
        },
        {
            title: "",
            description: "",
            rentPricePerDay: null,
            photos: []
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders "No drafts" message when drafts array is empty', () => {
        render(<Drafts onDelete={mockOnDelete} onEdit={mockOnEdit} />);
        expect(screen.getByText('Nėra juodraščių')).toBeInTheDocument();
    });

    test('renders drafts list correctly with data', () => {
        render(
            <Drafts
                drafts={sampleDrafts}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        expect(screen.getByText('Test Equipment 1')).toBeInTheDocument();
        expect(screen.getByText('Test Equipment 2')).toBeInTheDocument();
        expect(screen.getByText('Neužpildytas')).toBeInTheDocument();

        expect(screen.getByText(/Test Description 1/)).toBeInTheDocument();
        expect(screen.getByText(/Test Description 2/)).toBeInTheDocument();

        expect(screen.getByText(/50€/)).toBeInTheDocument();
        expect(screen.getByText(/75€/)).toBeInTheDocument();
        expect(screen.getByText(/Kaina neįvesta/)).toBeInTheDocument();
    });

    test('renders images and placeholder SVGs correctly', () => {
        render(
            <Drafts
                drafts={sampleDrafts}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        const image = screen.getByAltText('Test Equipment 1');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'test-photo-url-1');

        const svgs = document.querySelectorAll('svg');
        expect(svgs.length).toBe(2);
    });

    test('calls onDelete with correct index when delete button is clicked', () => {
        render(
            <Drafts
                drafts={sampleDrafts}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        const deleteButtons = screen.getAllByText('Pašalinti');
        fireEvent.click(deleteButtons[1]);

        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    test('calls onEdit with correct index when edit button is clicked', () => {
        render(
            <Drafts
                drafts={sampleDrafts}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        const editButtons = screen.getAllByText('Redaguoti');
        fireEvent.click(editButtons[0]);

        expect(mockOnEdit).toHaveBeenCalledTimes(1);
        expect(mockOnEdit).toHaveBeenCalledWith(0);
    });

    test('renders draft with missing data correctly', () => {
        const draftWithMissingData = [{
            title: null,
            description: null,
            rentPricePerDay: null,
            photos: []
        }];

        const { container } = render(
            <Drafts
                drafts={draftWithMissingData}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        const listItem = container.querySelector('li');
        expect(listItem).toBeInTheDocument();

        const { getByText } = within(listItem);
        expect(getByText('Neužpildytas')).toBeInTheDocument();

        expect(listItem.textContent).toContain('Nėra aprašymo');
        expect(listItem.textContent).toContain('Kaina neįvesta');

        expect(getByText('Redaguoti')).toBeInTheDocument();
        expect(getByText('Pašalinti')).toBeInTheDocument();

        expect(listItem.querySelector('.iranga-photo-placeholder')).toBeInTheDocument();
    });

    test('renders correct number of action buttons', () => {
        render(
            <Drafts
                drafts={sampleDrafts}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        const editButtons = screen.getAllByText('Redaguoti');
        const deleteButtons = screen.getAllByText('Pašalinti');

        expect(editButtons.length).toBe(3);
        expect(deleteButtons.length).toBe(3);
    });
});