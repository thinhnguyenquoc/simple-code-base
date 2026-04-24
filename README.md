# Simple Code Base

A basic Express.js application with PostgreSQL database integration using Sequelize ORM (code first approach).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)

### Installation

1. Clone the repository (if applicable) or navigate to the project directory.
2. Install the dependencies:

```bash
npm install
```

3. Set up PostgreSQL database:
   - Install and start PostgreSQL server
   - Create a database named `simple_code_base`
   - Update the database credentials in `src/config/database.js` if necessary (default: user='postgres', password='password', host='localhost')

### Database Configuration

The application uses Sequelize ORM with code-first approach. Tables are automatically created/updated when the server starts.

## Running the Application

To start the server, run:

```bash
npm start
```

The server will be available at `http://localhost:3000`.

### API Endpoints

- `GET /`: Returns "Hello World!"
- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login and get JWT token
- `POST /friends/add`: Add a friend (requires authentication)
- `POST /friends/remove`: Remove a friend (requires authentication)
- `GET /friends/list`: List friends with pagination (requires authentication)
- `GET /hello`: Returns "new hello" (requires authentication)

## Running Tests

To execute the unit tests, use:

```bash
npm test
```

This project uses **Jest** as the test runner and **Supertest** for endpoint testing. Tests are located in the `src/test/` directory.

## Features

- User authentication with JWT
- Friend management system
- PostgreSQL database with Sequelize ORM
- Code-first database schema

## public github
https://github.com/thinhnguyenquoc/simple-code-base