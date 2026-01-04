# Zaykaa - The Authentic Snack Marketplace

Zaykaa is a hyperlocal food marketplace connecting traditional homemaker-chefs with urban consumers, built on the MERN stack (MongoDB, Express, React/Next.js, Node.js).

## 🚀 Tech Stack

- **Frontend:** Next.js, Typescript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT, OTP (Twilio/Firebase - *implied*)

## 🛠️ Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Git](https://git-scm.com/)

## 📥 Installation

Clone the repository:
```bash
git clone https://github.com/umamahesh358/zaykaa-final.git
cd zaykaa-final
```

### 1. Backend Setup (Server)

Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
# Add other specific variables as needed (e.g., SMTP_HOST, EMAIL_USER for notifications)
```

Start the backend server:
```bash
npm start
```
The server will run on `http://localhost:5000`.

### 2. Frontend Setup (Client)

Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Create a `.env.local` file in the `client` directory (if needed for API URLs):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```
The client will run on `http://localhost:3000`.

## 🏃‍♂️ How to Run

1.  **Start DB:** Ensure MongoDB is running.
2.  **Start Server:** Terminal 1 -> `cd server` -> `npm start`
3.  **Start Client:** Terminal 2 -> `cd client` -> `npm run dev`
4.  **Access:** Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

- `client/`: Next.js frontend application
- `server/`: Node.js/Express backend API

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
