# SKI EQUIPMENT RENT - Final Exam Project

An application to rent skiing equipment and manage rental items and user reservations.

## Table of Contents
- [About the Project](#about-the-project)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [File Structure](#file-structure)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About the Project

This project is a web-based application designed to simplify the process of renting ski equipment. It provides an intuitive interface for users to browse, reserve, and manage their rented equipment. Admins can manage equipment, reservations, and user roles. Users can browse the skii equipment, reserve it using a calendar, check his/hers reservations and cancel it. All the user, equipment and reservation details are saved in the database.

## Features

- **User Authentication**: Sign up and log in to manage reservations.
- **Equipment Management**: Admins can add, edit, or delete ski equipment from the database.
- **Drafts Management**: Admins can save unfinished equipment in drafts before finalizing.
- **Reservation System**: Users can select a date range for rentals.
- **User Management**: Admins can change user roles, delete users, and check user reservations.
- **Reservation Modification**: Users can modify or delete reservations.
- **Rental Period Adjustment**: Admins can modify reservation dates and statuses.

## Installation

### Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/VeronikaSindeikyte/egzamino-projektas
   ```

2. Navigate to the project directory:
   ```bash
   cd egzamino-projektas
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the application:
   ```bash
   npm run dev
   ```

## Usage

After installation, open the app in your browser at `http://localhost:5173/`.

### User Guide
- **Sign Up / Log In**: Create an account or log in to reserve equipment.

![image](https://github.com/user-attachments/assets/24f8020f-0b7d-45cc-85cb-aa041c8a27bd)

- **Browsing Equipment**: View available ski equipment.

![image](https://github.com/user-attachments/assets/d86e0082-b6b0-4ccc-a5dd-397b0e662ad2)



- **Making a Reservation**: Select a date range and confirm your rental.

![image](https://github.com/user-attachments/assets/d001de7f-2bb7-4047-ad6a-830300089030)

- **Managing Reservations**:
  - Users can modify or cancel their reservations.
 
![image](https://github.com/user-attachments/assets/8bb37b54-49d0-42f0-98c3-762251923857)

 - Users can change reservation time (which is preselected in the calendar) if reservation is not yet approved by admin.

![image](https://github.com/user-attachments/assets/6d8c0d94-941c-4dc3-9783-84bcbf7e7205)


- **Admin Panel**:
  - Add, edit, or delete equipment.

![image](https://github.com/user-attachments/assets/91dc6232-f87d-4026-a8b2-48b1ed4e8654)

![image](https://github.com/user-attachments/assets/919c5ca4-fdc3-4f42-986e-6848adf9f97a)

  - Manage drafts before adding equipment to the database.

![image](https://github.com/user-attachments/assets/5a835254-d2f3-4c5b-a50f-63db8a4d345d)

  - Change user roles and view user reservations.

![image](https://github.com/user-attachments/assets/a7ba0300-bb6b-4125-a515-a4ddaf83cdea)


![image](https://github.com/user-attachments/assets/a7fecf71-aba3-474b-92e3-91337ba9f552)




## Technologies Used
- **Frontend**: React.js, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Styling**: CSS
- **Testing**: Jest, React Testing Library

## File Structure
```
project-root/
│── node_modules/       # Dependencies
│── public/            # Static files
│── server/            # Backend files
│   ├── controllers/   # Handles API requests
│   ├── middleware/    # Authentication and file handling
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── .env           # Environment variables
│   ├── server.js      # Main backend file
│── src/               # Frontend files
│   ├── components/    # Reusable components
│   │   ├── componentsCSS/   # Component-specific styles
│   │   ├── componentsTESTS/ # Component tests
│   ├── context/       # Context API for state management
│   ├── hooks/         # Custom React hooks
│   ├── images/        # Image assets
│   ├── layouts/       # Layout components
│   ├── pages/         # Page views
│   │   ├── pagesCSS/   # Pages-specific styles
│   ├── App.jsx        # Main App component
│   ├── index.css      # Global styles
│   ├── main.jsx       # Application entry point
│── .gitignore         # Ignored files in Git
│── babel.config.cjs   # Babel configuration
│── eslint.config.js   # ESLint configuration
│── index.html         # Main html document
│── jest.config.cjs    # Jest testing environment configuration
│── jest.setup.cjs     # Jest testing environment setup
│── package.json       # Dependencies and scripts
│── README.md          # Project documentation
│── vite.config.js     # Vite configuration
```

## API Endpoints

### User Routes
| Method | Endpoint             | Description                     |
|--------|----------------------|---------------------------------|
| POST   | `/api/user/signup`   | User registration               |
| POST   | `/api/user/login`    | User login                      |
| GET    | `/api/users`         | Get all users (Admin only)      |
| PATCH  | `/api/users/:id`     | Change user role (Admin only)   |
| DELETE | `/api/users/:id`     | Delete a user (Admin only)      |

### Equipment Routes
| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| GET    | `/api/iranga`     | Get all equipment (User and Admin) |
| GET    | `/api/iranga/:id` | Get one equipment (User and Admin) |
| POST   | `/api/iranga`     | Add new equipment (Admin)          |
| PATCH  | `/api/iranga/:id` | Update equipment details (Admin)   |
| DELETE | `/api/iranga/:id` | Delete equipment (Admin)           |

### Reservation Routes
| Method | Endpoint                       | Description                                   |
|--------|--------------------------------|-----------------------------------------------|
| POST   | `/api/reserve`                 | Create a reservation (User and Admin)         |
| GET    | `/api/reservations`            | Get all reservations (User)                   |
| GET    | `/api/reservations/:id`        | Get all reservations of selected user (Admin) |
| DELETE | `/api/reservations/:id`        | Delete reservation (User)                     |
| DELETE | `/api/delete/reservations/:id` | Delete reservation (Admin)                    |
| PATCH  | `/api/update/reservations/:id` | Change reservation status (Admin)             |
| PATCH  | `/api/reservations/:id`        | Change reservation date (User and Admin)      |


## Testing

### Running Tests
To execute unit and integration tests:
```bash
npm test
```
Testing is implemented using Jest and React Testing Library.

## Contributing

If you want to contribute:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit changes: `git commit -m "Added new feature"`.
4. Push to your branch: `git push origin feature-name`.
5. Open a pull request.

## License

This project is licensed under the MIT License.

## Contact

For any inquiries or support, reach out to:
- **Author**: Veronika Sindeikyte
- **Email**: [veronika.sindeikyte@gmail.com]
- **GitHub**: [VeronikaSindeikyte](https://github.com/VeronikaSindeikyte)
