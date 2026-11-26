# Zuri Healthcare
### Hospital Management Application

**Assignment Title:** Zuri Healthcare – Hospital Management Application  
**Student:** Mohamedamin Osman

---

## 1. Project Overview

Zuri Healthcare is a web-based hospital management application developed to simplify healthcare administration and improve the management of interactions between patients, doctors and administrators.

The application provides a centralised platform where patients can register, book appointments and monitor their appointment status. Doctors can manage appointment requests assigned to them, while administrators oversee users, doctors, patients and appointments.

The system was developed using React, Node.js, Express and MySQL.

## 2. Technologies Used

The application uses the following technologies:

| Technology | Purpose |
|---|---|
| React | Frontend development |
| Vite | Frontend development server and build tool |
| CSS | Application styling and responsive layouts |
| Node.js | Backend JavaScript runtime |
| Express.js | Backend API and routing |
| MySQL / MariaDB | Database management |
| mysql2 | Node.js database connectivity |
| JWT | Authentication and access control |
| bcryptjs | Password hashing |
| Git and GitHub | Version control |

## 3. System User Roles and Functionality

### 3.1 Patient

Patients can:
- Register for an account.
- Log in securely.
- Access their personal dashboard.
- View available doctors.
- Book medical appointments.
- View their appointment history.
- Track appointment statuses.

### 3.2 Doctor

Doctors are registered by the administrator and use their assigned credentials to access the system.

Doctors can:
- Log in securely.
- Access their professional dashboard.
- View appointments assigned to them.
- Review patient and appointment information.
- Approve appointment requests.
- Decline appointment requests.
- Mark approved appointments as completed.

### 3.3 Administrator

The administrator oversees the entire application.

Administrators can:
- Log in securely.
- Access the administration dashboard.
- Add new doctors.
- View, edit and delete doctor records.
- View, edit and delete patient records.
- View and manage appointments.
- Monitor the general activity of the healthcare platform.

## 4. Database Design

The application uses a MySQL database named `zuri_healthcare`.

The database contains four main tables:

| Table | Description |
|---|---|
| `users` | Stores account information, login credentials and user roles. |
| `patients` | Stores patient-specific information. |
| `doctors` | Stores professional information about registered doctors. |
| `appointments` | Stores appointment details and their current statuses. |

The database uses primary keys and foreign keys to establish relationships between records.

Appointment statuses include:
- `pending`
- `approved`
- `declined`
- `completed`

The foreign-key relationships use cascading deletion to maintain referential integrity.

The database export is located at:

`database/zuri_healthcare.sql`

## 5. Application Structure

The project is organised into frontend and backend components.

```text
zuri-healthcare/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── server.js
│
├── database/
│   └── zuri_healthcare.sql
│
├── src/
│   ├── components/
│   │   └── common/
│   ├── context/
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── doctor/
│   │   └── patient/
│   ├── services/
│   └── styles/
│
├── public/
├── index.html
├── package.json
└── README.md
```

*Note: The folder structure above describes the main organisation of the application. Refer to the actual project files for the complete directory listing.*

## 6. Installation and Setup

### Prerequisites

Install the following:
- Node.js and npm.
- MySQL or MariaDB.
- XAMPP (for the local database environment).
- A modern web browser.

### Step 1: Clone or extract the project

Open a terminal in the project directory.

### Step 2: Install frontend dependencies

```bash
npm install
```

### Step 3: Install backend dependencies

```bash
cd backend
npm install
```

### Step 4: Configure the database

1. Start the MySQL service.
2. Open phpMyAdmin.
3. Create a database named `zuri_healthcare`.
4. Select the database.
5. Open the Import tab.
6. Import `database/zuri_healthcare.sql`.

### Step 5: Configure backend environment variables

Create a `backend/.env` file and configure the database connection and JWT secret using the variable names expected by the backend configuration.

Do not commit the `.env` file or share private credentials.

### Step 6: Start the backend

From the backend directory:

```bash
npm run dev
```

The Express backend runs on:

`http://localhost:5000`

### Step 7: Start the frontend

Open another terminal, navigate to the project root and run:

```bash
npm run dev
```

The Vite development server runs at:

`http://localhost:5173`

Open the frontend address in your browser to access Zuri Healthcare.

## 7. Authentication and Security

The application implements authentication and role-based authorisation.

Security features include:
- Password hashing using bcryptjs.
- JSON Web Tokens for authenticated requests.
- Protected frontend routes.
- Role-based access for patients, doctors and administrators.
- Authenticated backend API routes.
- Database queries using mysql2.

Users are restricted to the sections permitted by their assigned roles.

## 8. Challenges Encountered and Solutions

During development, several setup and implementation challenges were encountered.

### 8.1 Node.js Environment Configuration

**Challenge:** Node.js and npm needed to be configured correctly in the Ubuntu development environment.

**Solution:** Node Version Manager (NVM) was configured and used to install Node.js. The development environment was subsequently confirmed to use Node.js 26.13.1 and npm 11.20.0.

### 8.2 Missing React Router Dependency

**Challenge:** Vite initially reported that it could not resolve the `react-router-dom` import used by the application.

**Solution:** The missing React Router dependency was addressed so that the application could use its routing configuration.

### 8.3 XAMPP and Apache Port Conflict

**Challenge:** The system's existing Apache service interfered with XAMPP when attempting to use the local web server port.

**Solution:** The conflicting Ubuntu Apache service was stopped before starting XAMPP.

### 8.4 Frontend and Backend Integration

**Challenge:** The React frontend needed to communicate with the Express backend and retrieve information from the MySQL database.

**Solution:** API services were implemented to handle frontend requests, while Express routes and controllers process requests and communicate with the database.

### 8.5 Role-Based Access

**Challenge:** Patients, doctors and administrators require different permissions and dashboards.

**Solution:** Authentication context, protected frontend routes and backend role authorisation were implemented to control access.

### 8.6 Navigation and Responsive Design

**Challenge:** Navigation needed to remain consistent across the different user dashboards and screen sizes.

**Solution:** The dashboard navigation was refined to use a full sidebar controlled by a hamburger menu, with responsive behaviour for smaller screens.

## 9. Testing and Verification

The application was tested through its main user workflows.

The following functionality was verified during development:

- Patient registration and login.
- Doctor login and dashboard access.
- Administrator login and dashboard access.
- Patient appointment booking.
- Doctor access to assigned appointment requests.
- Doctor approval of appointment requests.
- Patient visibility of updated appointment status.
- Administration and management of system records.

The appointment workflow was tested by booking an appointment as a patient and subsequently logging in as a doctor to approve the request.

## 10. Final Product

Zuri Healthcare provides a centralised hospital management platform with three distinct user roles.

The completed application brings together patient registration, appointment booking, doctor appointment management and administrative user management.

The project demonstrates the integration of a React frontend, Node.js and Express backend, and MySQL database in a full-stack web application.

---

**Project:** Zuri Healthcare  
**Assignment:** Hospital Management Application  
**Student:** Mohamedamin Osman