# Simple Code Base

A basic Express.js application showcasing a simple API endpoint and unit testing with Jest and Supertest.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository (if applicable) or navigate to the project directory.
2. Install the dependencies:

```bash
npm install
```

## Running the Application

To start the server, run:

```bash
npm start
```

The server will be available at `http://localhost:3000`.

### API Endpoints

- `GET /`: Returns "Hello World!"
- `GET /hello`: Returns "hello"

## Running Tests

To execute the unit tests, use:

```bash
npm test
```

This project uses **Jest** as the test runner and **Supertest** for endpoint testing. Tests are located in the `src/test/` directory.

## Hello API

- need return "new hello"