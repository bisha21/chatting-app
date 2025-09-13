# Chatting App 💬

A full-stack real-time chatting application built with **TypeScript**, **Express**, **Prisma**, and **Socket.IO** for the backend, and **React**, **TanStack Query**, **Shadcn UI**, and **Tailwind CSS** for the frontend.  

This app allows users to register, log in, and chat in real-time, with secure authentication using **JWT** and password hashing via **bcrypt**.

---

## Features

### Backend
- **Express.js** server with TypeScript
- **Prisma ORM** connected to PostgreSQL for data modeling
- **Socket.IO** for real-time messaging
- **JWT authentication** for secure login
- **bcrypt** for password hashing
- **Cookie-parser** to manage authentication tokens
- RESTful API endpoints for user and message management
- Automatically tracks **message seen status** and timestamps

### Frontend
- **React** with TypeScript
- **TanStack Query** for server-state management
- **Shadcn UI** for modern components
- **Tailwind CSS** for styling
- Real-time messaging interface with online/offline status
- Search users and chat history
- Responsive design for desktop and mobile

---

## Tech Stack

**Backend:**  
- Node.js, Express, TypeScript  
- Prisma ORM (PostgreSQL)  
- Socket.IO  
- JWT, bcrypt, cookie-parser  

**Frontend:**  
- React, TypeScript  
- TanStack Query  
- Shadcn UI  
- Tailwind CSS  

---

## Installation

### Backend
```bash
cd backend
npm install
npm run dev
