# Nexus News

### A Full-Stack News & Editorial Publishing Platform

Nexus News is a modern, full-stack news and editorial publishing platform designed to deliver an interactive reading experience and streamlined content management workflow.

Readers can explore news articles across categories, search the publication archive, bookmark stories, participate in discussions, and subscribe to newsletter updates. Verified users and administrators have access to dedicated dashboards with role-based functionality, while real-time communication is powered by Socket.IO.

Built with React, Node.js, Express, and MongoDB, Nexus News demonstrates full-stack application development, secure authentication, REST API integration, content management, and real-time event handling.

---

## Live Application

| Service | Link |
|---|---|
| **Live Website** | [Nexus News](https://ubiquitous-conkies-8dd6d5.netlify.app/) |
| **Backend API** | [Nexus News API](https://mern-project-nexus-news.onrender.com/) |
| **GitHub Repository** | [View Source Code](YOUR_GITHUB_REPOSITORY_URL) |

---

## Key Features

### Reader Experience
- Responsive homepage featuring highlighted stories and category-based content.
- Dedicated article pages with sanitized rich-text content.
- Category-based news archives and recent article listings.
- Article search functionality using titles and excerpts.
- Related-story navigation.
- Commenting and discussion functionality.
- Bookmark articles for convenient access.
- Newsletter subscription with duplicate-email validation.

### Authentication & User Management
- User registration and authentication.
- Email verification during registration.
- Resend verification email functionality.
- Secure password hashing using bcryptjs.
- JWT-based authentication.
- Protected routes and verified-account access.
- Dedicated user dashboard.
- Saved articles and notification management.

### Administration & Content Management
- Dedicated administrator dashboard.
- Create, publish, edit, and delete news articles.
- Rich-text article editing using Tiptap.
- Image uploads through ImageKit.
- Comment moderation and management.
- Newsletter subscriber management.
- Role-based authorization for administrative operations.

### Real-Time Communication
- Socket.IO integration for live application activity.
- Notifications for newly published articles.
- Subscription activity notifications.
- Comment notifications.
- Comment read-state updates.

### Security & Reliability
- Password hashing with bcryptjs.
- JWT-protected API endpoints.
- Role-based access control.
- One-time, time-limited email verification tokens.
- SHA-256 hashing for stored verification tokens.
- Server-signed ImageKit upload authentication.
- Sanitized rich-text content.
- Environment-based configuration for sensitive credentials.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, React Router |
| Styling | Tailwind CSS |
| Rich Text Editor | Tiptap |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-Time Communication | Socket.IO |
| Transactional Email | Brevo API |
| Image Management | ImageKit |
| Deployment | Netlify, Render |

---

## Application Architecture

Nexus News follows a client-server architecture with a dedicated frontend, backend API, database, and external service integrations.

```text
                 NEXUS NEWS
                      |
          +-----------+-----------+
          |                       |
     React Frontend          Express Backend
       (Netlify)                (Render)
          |                       |
          |              +--------+--------+
          |              |        |        |
          |           MongoDB  Socket.IO  Services
          |              |                 |
          |              |           +-----+------+
          |              |           |            |
          |              |         Brevo       ImageKit
          |              |
          +------ REST API / HTTP ------+
```

### Project Structure

```text
Nexus-News/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── assets/
│   ├── .env.example
│   ├── netlify.toml
│   └── package.json
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

*The directory structure above represents the logical organization of the application. Adjust individual folder names if your actual repository differs.*

---

## Getting Started

Follow these instructions to run Nexus News locally.

### Prerequisites

Make sure you have the following installed:

- Node.js (LTS recommended)
- npm
- MongoDB database (local or MongoDB Atlas)
- Git

External service accounts are required for the corresponding features:

- Brevo for transactional emails.
- ImageKit for image uploads.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Nexus-News
```

### 2. Backend Configuration

Navigate to the server directory:

```bash
cd server
npm install
```

Create your environment file:

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

Configure the following environment variables in `server/.env`:

| Variable | Description |
|---|---|
| `PORT` | Backend server port. Defaults to `5000`. |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign authentication tokens. |
| `CLIENT_URL` | Comma-separated list of permitted frontend origins. |
| `FRONTEND_URL` | Optional fallback frontend URL for verification links. |
| `BREVO_API_KEY` | Brevo transactional email API key. |
| `BREVO_SENDER_EMAIL` | Verified sender email address. |
| `BREVO_SENDER_NAME` | Optional sender display name. |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key. |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key. |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint. |

Start the backend development server:

```bash
npm run dev
```

The backend health endpoint should be accessible at:

`http://localhost:5000/`

### 3. Frontend Configuration

Open a second terminal and navigate to the client directory:

```bash
cd client
npm install
```

Create the frontend environment file:

```powershell
Copy-Item .env.example .env
```

Configure `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

Open the application:

`http://localhost:5173`

**Using the hosted backend locally:** Set `VITE_API_URL` to the Render API URL and include `http://localhost:5173` in the backend's `CLIENT_URL` configuration.

---

## Deployment Guide

Nexus News uses separate hosting services for its frontend and backend.

### Frontend Deployment: Netlify

The React/Vite frontend is deployed on Netlify.

- Build configuration: `client/netlify.toml`
- Build command: `npm run build`
- Publish directory: `dist`

Configure the following environment variable in Netlify:

```env
VITE_API_URL=https://mern-project-nexus-news.onrender.com
```

The Netlify configuration includes SPA routing support, allowing direct access to application routes such as `/verify-email`.

**Important:** Vite environment variables are embedded during the production build. Redeploy the application after changing them.

### Backend Deployment: Render

The Express backend is deployed on Render.

Configure the required environment variables in the Render dashboard:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173,https://ubiquitous-conkies-8dd6d5.netlify.app
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=Nexus News
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Render provides the `PORT` environment variable automatically.

Keep all sensitive credentials inside the hosting provider's environment configuration.

---

## Email Verification Workflow

Nexus News implements an email verification process to ensure that newly registered accounts can verify ownership of their email addresses.

The workflow:

1. A user submits the registration form.
2. The backend creates an unverified account.
3. A random, one-time verification token is generated.
4. Only the SHA-256 hash of the token is stored in MongoDB.
5. The verification email is sent through the Brevo transactional email API.
6. The user opens the verification link on the frontend.
7. The frontend sends the token to the backend verification endpoint.
8. The backend validates the token and its expiration.
9. The account is marked as verified.

Verification tokens expire after 24 hours and can be replaced by requesting a new verification email.

---

## API Documentation

All backend endpoints are prefixed with `/api`.

| Module | Endpoint | Access |
|---|---|---|
| Authentication | `POST /auth/register` | Public |
| Authentication | `POST /auth/resend-verification` | Public |
| Authentication | `GET /auth/verify/:token` | Public |
| Authentication | `POST /auth/login` | Public |
| Authentication | `GET /auth/me` | Verified User |
| Bookmarks | `POST /auth/bookmarks/:blogId` | Verified User |
| Blogs | `GET /blogs` | Public |
| Blogs | `GET /blogs/recent` | Public |
| Blogs | `GET /blogs/:slug` | Public |
| Blogs | `POST /blogs` | Administrator |
| Blogs | `PUT /blogs/:id` | Administrator |
| Blogs | `DELETE /blogs/:id` | Administrator |
| Comments | `POST /blogs/:id/comments` | Public |
| Comments | `GET /blogs/admin/comments` | Administrator |
| Comments | `PATCH /blogs/:blogId/comments/:commentId/read` | Administrator |
| Comments | `DELETE /blogs/:blogId/comments/:commentId` | Administrator |
| Subscribers | `POST /subscribers` | Public |
| Subscribers | `GET /subscribers` | Administrator |
| ImageKit | `GET /imagekit/auth` | Verified Administrator |

Protected API requests require a JWT access token:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Administrator Setup & Sample Data

The backend includes a seed script:

```bash
node seed.js
```

The script uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` to create an administrator account and sample blog posts.

**Warning:** The current seed script deletes existing users and blog posts before inserting sample data.

Never execute this script against a production database or any database containing information you want to preserve.

---

## Available Scripts

### Frontend (`client/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Generate the production build. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint checks. |

### Backend (`server/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the backend using Nodemon. |
| `npm start` | Start the production backend server. |

---

## Security Considerations

Security is an important part of the Nexus News architecture.

- Passwords are hashed using bcryptjs rather than stored as plain text.
- Authentication is handled through JWT-protected routes.
- Administrator operations are protected by role-based authorization.
- Email verification tokens are stored as SHA-256 hashes.
- Verification tokens are single-use and time-limited.
- Rich-text article content is sanitized before rendering.
- ImageKit upload credentials are generated server-side.
- Sensitive environment variables are excluded from frontend code.
- Database credentials, API keys, and JWT secrets must never be committed to GitHub.

---

## Project Objectives & Learning Outcomes

Nexus News was developed to demonstrate practical full-stack engineering skills through the implementation of a complete editorial publishing workflow.

Key areas of development include:

- Building a responsive React application.
- Designing RESTful APIs with Express.js.
- Managing application data using MongoDB and Mongoose.
- Implementing authentication and role-based authorization.
- Integrating third-party email and image services.
- Implementing real-time notifications using Socket.IO.
- Managing frontend and backend deployment independently.
- Configuring production environment variables and application routing.

---

## Acknowledgements

Developed as part of the **Codveda Technology Internship Program**.

This project represents practical experience in full-stack web development, application architecture, API integration, and deployment.

---

**Nexus News | Connecting Readers with Stories That Matter.**
