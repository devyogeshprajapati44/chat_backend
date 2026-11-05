
# Chat Backend API

A chat backend application developed using Node.js,
TypeScript, MySQL, Firebase Firestore and JWT.

## Technologies

- Node.js
- Express.js
- TypeScript (Strict Mode)
- MySQL
- Firebase Firestore
- Firebase Admin SDK
- JWT Authentication
- bcryptjs

## Features

- User registration and login
- JWT authentication
- Create or get 1:1 chat
- Send messages
- Retrieve messages with pagination
- Message ordering by timestamp
- Read receipts
- Last seen tracking
- List user chats
- Chat membership authorization

## Installation

Clone the repository:

git clone YOUR_GITHUB_REPOSITORY_URL

Install dependencies:

npm install

Configure your .env file.

Create the MySQL database and tables
using the provided SQL schema.

Configure Firebase Admin credentials.

Start development server:

npm run dev

Build TypeScript:

npm run build

Start production server:

npm start

## API Base URL

http://localhost:5000

## Authentication

Use JWT Bearer token authentication.

## Database Architecture

MySQL:
- Users
- Chats
- Chat Members

Firebase Firestore:
- Messages
- Read Receipts
- Last Seen

## API Endpoints

POST /auth/register
POST /auth/login
POST /chat/create
POST /chat/:chatId/message/send
GET /chat/:chatId/messages
POST /chat/:chatId/message/:messageId/read
POST /chat/:chatId/lastseen
GET /user/:userId/chats

## Author

Yogesh Kumar Prajapati