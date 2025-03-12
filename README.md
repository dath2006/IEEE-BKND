# Anonymous Teacher Feedback System

A scalable Node.js backend application for managing student feedback for teachers. Built with Express.js, TypeScript, and MongoDB.

## Features

- 🔐 Secure Authentication System

  - JWT-based authentication
  - Role-based access control (Student/Teacher)
  - Password hashing with bcrypt

- 👥 User Management

  - Student registration and login
  - Teacher registration and login

- 📝 Feedback System

  - Students can submit feedback for teachers
  - Teacher cannot directly access student's feedback
  - Rating system
  - Prevention of duplicate feedback
  - Analytics for teacher performance

- 🛡️ Security Features

  - Rate limiting
  - NoSQL injection protection
  - XSS protection
  - Parameter pollution prevention
  - CORS configuration
  - Helmet security headers

- 🚀 Performance
  - MongoDB connection pooling
  - Clustering support for multi-core systems

## Tech Stack

- Node.js & Express.js
- TypeScript
- MongoDB with Mongoose
- Winston for logging
- Zod for validation
- Jest for testing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- TypeScript

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dath2006/IEEE-BKND.git
   cd ieee-bknd
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. configure `.env` file in the root directory:

   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your_mongodb_uri // let it be default
   JWT_SECRET=your_jwt_secret
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Running the Application

```bash
npm run start
```

## API Documentation

[![Run in Postman](https://run.pstmn.io/button.svg)](https://dath-api.postman.co/workspace/DATH-API-Workspace~da0b35bf-04a4-4619-b2b6-2d5f6012c144/collection/40574721-05eadb95-77d0-4cc4-9b07-5a9b16d6c713?action=share&creator=40574721)

Test the API endpoints directly in Postman by clicking the button above. The collection includes all endpoints with clean documentation for requests and responses.

### Authentication

- POST `/student/register` - Register a new student

  ```json
  {
    "name": "Student Name",
    "email": "student@example.com",
    "password": "password123"
  }
  ```

- POST `/student/login` - Student login

  ```json
  {
    "email": "student@example.com",
    "password": "password123"
  }
  ```

- POST `/teacher/register` - Register a new teacher

  ```json
  {
    "name": "Teacher Name",
    "email": "teacher@example.com",
    "password": "password123"
  }
  ```

- POST `/teacher/login` - Teacher login

  ```json
  {
    "email": "teacher@example.com",
    "password": "password123"
  }
  ```

- GET `/student/logout` - Student logout
- GET `/teacher/logout` - Teacher logout

### Student Routes

- GET `/student/dashboard` - Student dashboard
- GET `/student/feedback?id=` - Get feedback form for a teacher (Get id from MongoDB Compass)
- POST `/student/feedback?id=` - Submit feedback for a teacher (Get id from MongoDB Compass)
  ```json
  {
    "feedback": "positive",
    "rating": 5
  }
  ```

### Teacher Routes

- GET `/teacher/dashboard` - Teacher dashboard - It also gives some embedded HTML feedback analysis
- GET `/teacher/analytics` - View feedback analytics

## Scalability

The application is designed to be scalable:

- Clustering support for multiple CPU cores
- Connection pooling for MongoDB
- Graceful error handling and shutdown
- Structured logging

## Error Handling

- Centralized error handling
- Detailed logging in development
- Sanitized error responses in production
- Request validation using Zod

## Author

Sathish Dath D S
