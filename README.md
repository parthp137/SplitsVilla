# SplitsVilla – Group Travel & Expense Management Platform

SplitsVilla is a full-stack web application that simplifies group travel by combining property booking, trip planning, and expense management into one seamless platform. It brings together the core ideas of Airbnb and Splitwise, enabling groups to collaboratively choose stays, track shared expenses, and settle payments efficiently.

## Live Demo

(Add your deployed link here)

## Features

### Group Trip Planning

* Create and manage trips with friends
* Invite members using unique invite codes
* Track trip status (planning → booked → completed)
* View trip history for past travels

### Property Discovery & Booking

* Advanced search (city, price, amenities, property type)
* Detailed property pages with images, ratings, and amenities
* Wishlist system for saving properties
* Map-based location view (Leaflet integration)

### Collaborative Voting System

* Vote on properties within a trip
* Real-time vote updates using WebSockets
* Smart ranking algorithm based on affordability, ratings, amenities, votes, and capacity

### Expense Management

* Add and split expenses among group members
* Multi-currency support (INR, USD, EUR, etc.)
* Automatic debt settlement (minimizes transactions)
* Category-based expense tracking
* Export expense reports

### AI Features

* Budget estimation based on trip details
* Smart travel suggestions using Claude API
* Personalized recommendations based on group size

### Real-Time Collaboration

* Live updates for votes, expenses, and members
* Socket.io integration for instant sync
* Notifications for trip activity

### User Experience

* Fully responsive (mobile-first design)
* Dark mode support
* Smooth animations and transitions
* Lazy loading and code splitting for performance
* Error handling and loading states

## Tech Stack

### Frontend

* React 18 + TypeScript
* Vite
* Tailwind CSS
* React Router
* Framer Motion
* Socket.io Client
* Leaflet

### Backend

* Node.js + Express
* MongoDB + Mongoose
* JWT Authentication
* Bcrypt
* Socket.io
* Nodemailer
* Anthropic Claude API

### Tools

* Git & GitHub
* ESLint + Prettier
* Vitest & Playwright

## Key Highlights

* Real-time group collaboration using WebSockets
* Intelligent expense settlement algorithm
* AI-powered travel assistance
* Scalable full-stack architecture
* Clean and modular code structure

## Project Structure

splitsvilla/
├── server/          # Backend (Express + MongoDB)
├── src/             # Frontend (React + TypeScript)
├── public/          # Static assets
├── docs/            # Documentation
├── tests/           # Unit & E2E tests
├── .env.example
└── README.md

## How to Run

### 1. Clone Repository

git clone https://github.com/yourusername/splitsvilla.git
cd splitsvilla

### 2. Install Dependencies

npm install
cd server && npm install && cd ..

### 3. Setup Environment Variables

Create .env and server/.env files:
MONGO_URI=mongodb://localhost:27017/splitsvilla
JWT_SECRET=your_secret_key
PORT=5000

### 4. Run Project

npm run dev

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Limitations

* No payment gateway integration yet
* Email system requires configuration
* AI features depend on external API keys

## Future Enhancements

* Payment integration (Stripe/Razorpay)
* Mobile app (React Native)
* Advanced analytics dashboard
* Real-time chat within trips
* Recommendation engine improvements

## Performance

* Optimized bundle with code splitting
* Lazy loading for images and pages
* Efficient API handling with caching

## Contributing

Feel free to fork and improve the project. Contributions are welcome!

## License

MIT License

## Contact

* GitHub: https://github.com/yourusername
* Project: SplitsVilla

Version: 1.0.0
Last Updated: April 2026
