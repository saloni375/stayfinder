# StayFinder – Backend API

REST API for StayFinder, a full-stack travel booking website.

🔗 **Live Demo:** https://stayfinder-frontend-eta.vercel.app
💻 **Frontend Repo:** https://github.com/saloni375/stayfinder-frontend

## Tech Stack
- Node.js, Express.js
- MongoDB with Mongoose
- JWT and bcrypt for authentication, Google OAuth for Google sign-in
- Cloudinary and Multer for profile photo uploads
- Deployed on Render, with the database on MongoDB Atlas

## Key Features
- **Authentication:** register and login with hashed passwords, Google sign-in, JWT tokens
- **Protected routes:** middleware verifies the JWT, and users can only access their own data (the user ID always comes from the token, never from the request body)
- **Booking validation:** dates, number of guests and the listing are all checked on the backend
- **Double-booking prevention:** a new stay booking is rejected (409) if it overlaps an existing booking
- **Cancellation:** users can cancel only their own upcoming bookings

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create an account |
| POST | `/api/auth/login` | – | Log in with email and password |
| POST | `/api/auth/google` | – | Log in with Google |
| GET | `/api/properties` | – | List all stays |
| GET | `/api/properties/:id` | – | Get one stay |
| GET | `/api/experiences` | – | List all experiences |
| GET | `/api/experiences/:id` | – | Get one experience |
| POST | `/api/bookings` | ✅ | Create a booking |
| GET | `/api/bookings` | ✅ | Get your bookings |
| DELETE | `/api/bookings/:id` | ✅ | Cancel your upcoming booking |
| GET | `/api/users/:id` | ✅ | Get your profile |
| PATCH | `/api/users/:id` | ✅ | Update your name |
| POST | `/api/upload/profile-photo` | ✅ | Upload a profile photo |
| DELETE | `/api/upload/profile-photo` | ✅ | Remove your profile photo |

✅ = requires the header `Authorization: Bearer <token>`

## How Double-Booking Prevention Works
Before saving a stay booking, the API looks for an existing booking of the same stay where:

```
existing.checkIn < new.checkOut  AND  existing.checkOut > new.checkIn
```

If one exists, the dates overlap, and the API returns `409 Conflict`.

## Run Locally
1. Clone and install:
   ```bash
   git clone https://github.com/saloni375/stayfinder.git
   cd stayfinder
   npm install
   ```
2. Create a `.env` file:
   ```
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Start the server:
   ```bash
   node server.js
   ```

> **Note for macOS:** Port 5000 is used by AirPlay Receiver, so this project uses port 5001 locally.