# 🏔️ Alpine Edge

**Alpine Edge** is a community-driven web platform where skiers and snowboarders can buy, sell, or offer ski-related equipment and services. It connects people passionate about skiing — allowing users to post listings for gear or offer services like waxing, tuning, or lessons — all without handling payments directly.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributors](#-contributors)

---

## 🧭 Project Overview

### Vision
> Keep the value in skiing and make buying easier.

### Core Features
- ⛷️ **Buy and sell** used ski and snowboard gear
- 🔧 **Offer or request** ski services (e.g., tuning, waxing, lessons)
- 📍 **Filter listings** by location, price, and category
- 💬 **Message or negotiate** directly with other users via real-time chat

---

## 🛠️ Tech Stack

- **Frontend:** Handlebars (templating engine)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Real-time Communication:** Socket.io
- **Containerization:** Docker + Docker Compose
- **Architecture:** MVC pattern with RESTful routes
- **File Storage:** AWS S3
- **Image Processing:** Sharp

---

## 📁 Project Structure

```
Ski-Website.-Apine-Edge/
│
├── Homepage/                    # Frontend assets and views
│   ├── public/                  # Static files
│   │   ├── css/                 # Stylesheets
│   │   │   ├── style.css        # Main styles
│   │   │   ├── advanced-search.css
│   │   │   ├── chat.css
│   │   │   └── product-detail.css
│   │   └── js/                  # Client-side JavaScript
│   │       ├── advancedSearch.js
│   │       ├── chat.js
│   │       ├── createListing.js
│   │       └── locationAutocomplete.js
│   └── views/                   # Handlebars templates
│       ├── layouts/
│       │   └── main.hbs         # Main layout template
│       ├── pages/                # Page templates
│       │   ├── home.hbs
│       │   ├── login.hbs
│       │   ├── register.hbs
│       │   ├── search.hbs
│       │   ├── advanced-search.hbs
│       │   ├── create-listing.hbs
│       │   ├── product-detail.hbs
│       │   ├── service-detail.hbs
│       │   ├── profile.hbs
│       │   ├── userProfile.hbs
│       │   ├── chat.hbs
│       │   └── connection-requests.hbs
│       └── partials/             # Reusable components
│           ├── header.hbs
│           ├── footer.hbs
│           ├── nav.hbs
│           ├── message.hbs
│           ├── contact-button.hbs
│           └── title.hbs
│
├── routes/                       # Express route handlers
│   ├── authRoutes.js            # Authentication (login, register, logout)
│   ├── homeRoutes.js            # Homepage routes
│   ├── userRoutes.js            # User management routes
│   ├── profileRoutes.js         # User profile routes
│   ├── searchRoutes.js          # Search functionality
│   ├── listingRoutes.js         # Create listing routes
│   ├── productRoutes.js         # Product detail routes
│   ├── serviceRoutes.js         # Service detail routes
│   └── chatRoutes.js            # Chat and messaging routes
│
├── init_data/                    # Database initialization
│   ├── Create-Tables.sql        # Database schema
│   └── Populate-Test-Data.sql   # Sample data
│
├── test/                         # Test files
│   └── server.spec.js           # Server tests
│
├── Milestone Submissions/        # Project documentation
│   ├── WIreframes/              # UI wireframes
│   ├── Team Meeting Logs/       # Meeting notes
│   ├── ProjectReport_016-1.pdf
│   ├── ProjectPresentation_016-1.pdf
│   ├── UAT_Test_Plan.txt
│   └── Release Notes.txt
│
├── index.js                      # Main application entry point
├── uploadMiddleware.js           # File upload middleware
├── docker-compose.yaml          # Docker configuration
├── package.json                 # Node.js dependencies
├── nodemon.json                 # Nodemon configuration
└── brands.json                  # Ski brand data
```

### Key Components

- **`index.js`**: Main server file that sets up Express, Handlebars, database connections, Socket.io, and routes
- **`routes/`**: Modular route handlers following RESTful conventions
- **`Homepage/views/`**: Handlebars templates organized by layouts, pages, and partials
- **`Homepage/public/`**: Static assets (CSS, JavaScript, images)
- **`init_data/`**: SQL scripts for database initialization

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Node.js** (v14 or higher)

#### Installing Node.js

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
sudo apt update
sudo apt install nodejs npm -y
```

**Windows:**
Download from [nodejs.org](https://nodejs.org/en/download)

> **Note for macOS:** If you don't have Homebrew installed, install it first:
> ```bash
> /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
> echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
> eval "$(/opt/homebrew/bin/brew shellenv)"
> ```

### Installation Steps

#### 1. Install Socket.io (Required for Chat Feature)

```bash
npm install socket.io
```

Then install dependencies inside Docker:
```bash
docker compose run --rm -u root web sh -lc "npm install"
```

#### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=alpineedge
POSTGRES_HOST=db
DATABASE_URL=postgres://postgres:postgres@db:5432/alpineedge

PORT=3000
NODE_ENV=development
SESSION_SECRET="super duper secret!"

# Add your API keys here (Google Maps API, AWS S3, etc.)
GOOGLE_API_KEY=your_google_api_key_here
```

> **Note:** The `.env` file contains sensitive information like API keys. Make sure it's listed in `.gitignore` and never commit it to version control.

#### 3. Install Dependencies

Install Node.js dependencies inside Docker:

```bash
docker compose run --rm -u root web sh -lc "npm install"
```

#### 4. Start the Application

Start the Docker containers:

```bash
docker compose up --build
```

The application will be available at: **http://localhost:3000**

#### 5. View Logs (Optional)

To monitor application logs:

```bash
# App logs
docker logs -f alpineedge_web

# Database logs
docker logs -f alpineedge_db

# All logs
docker compose logs -f
```

#### 6. Stop the Application

To stop the containers:

```bash
docker compose down
```

To stop and remove volumes (resets database):

```bash
docker compose down -v
```

---

## 💻 Development

### Development Mode (Auto-Restart)

The application runs in development mode by default with **nodemon**, which automatically restarts the server when files change.

```bash
docker compose up
```

You should see:
```
[nodemon] starting `node index.js`
✅ Server running on http://localhost:3000
Database connection successful
```

### Normal Mode (No Auto-Restart)

To run without auto-restart, modify `docker-compose.yaml`:

Change:
```yaml
command: "npm run dev"
```

To:
```yaml
command: "npm start"
```

Then start normally:
```bash
docker compose up
```

### Updating Dependencies

When installing new packages, update dependencies inside Docker:

```bash
docker compose run --rm -u root web sh -lc "npm install"
```

This ensures `node_modules` and `package.json` are updated consistently.

### Database Access

Access the PostgreSQL shell:

```bash
docker exec -it alpineedge_db psql -U postgres -d alpineedge
```

### Useful Commands

| Command | Description |
|---------|-------------|
| `docker compose restart web` | Restart only the Node.js container |
| `docker exec -it alpineedge_db psql -U postgres -d alpineedge` | Access PostgreSQL shell |
| `docker compose logs -f` | View all container logs in real time |
| `npm run dev` | Run server with nodemon (outside Docker) |
| `npm test` | Run test suite |

---

## 🌐 Deployment

### Deployed Website

**Live URL:** https://alpineedge-web.onrender.com/

---

  ## 👥 Contributors

- **Charlie Kasic**
- **Agustin Garcia-Huidobro**
- **David Poston**

---

## 📝 Additional Notes

- The database initializes automatically from SQL files in the `init_data/` directory
- Session data is stored in PostgreSQL using `connect-pg-simple`
- File uploads are handled via AWS S3 with image processing using Sharp
- Real-time chat functionality uses Socket.io with room-based messaging