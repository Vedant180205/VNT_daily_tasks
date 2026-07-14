# Frontend: Player Management Dashboard 🖥️

This is the React/Vite frontend for the Player Management application.

## ⚡ Day 6 Updates: Zero-Config Performance Boost
In the Day 6 update, the backend was upgraded with a **Redis Caching Layer**. 
Because the caching is handled entirely at the API level (intercepting `GET /api/players`), the frontend automatically benefits from dramatically faster load times and reduced loading spinner duration without requiring any code changes on the client side!

## ⚙️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *(The app will launch on `http://localhost:5173`)*
