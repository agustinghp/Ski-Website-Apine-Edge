## 🏔️ **Alpine Edge**


**Alpine Edge** is a community-driven web platform where skiers and snowboarders can buy, sell, or offer ski-related equipment and services.  
It connects people passionate about skiing — allowing users to post listings for gear or offer services like waxing, tuning, or lessons — all without handling payments directly.



!!New step!! run 
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
npm install socket.io 
then 
docker compose run --rm -u root web sh -lc "npm install"
for chat feature!
---

### 🧭 **Project Overview**

**Vision:**  
> Keep the value in skiing and make buying easier.

**Core Features:**
- ⛷️ Buy and sell used ski and snowboard gear  
- 🔧 Offer or request ski services (e.g., tuning, waxing, lessons)  
- 📍 Filter listings by location, price, and category  
- 💬 Message or negotiate directly with other users  

**Tech Stack:**
- **Frontend:** Handlebars (templating)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Containerization:** Docker + Docker Compose
- **Architecture:** MVC pattern with RESTful routes

---

### #1  
To run the code, you will need to download:
    
**Docker:**  
Visit the following Link to download  
👉 https://www.docker.com/products/docker-desktop/

**Node.js:**  
For **Mac:**
```bash
brew install node
```
*(Requires brew — see Brew Installer below)*  

For **Linux:**
```bash
sudo apt update
sudo apt install nodejs npm -y
```

For **Windows:**  
Visit this link and download:  
👉 https://nodejs.org/en/download

**Brew Installer (For downloading Node on Mac):**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```
-------------
** Also, you must install socket.io for the chat feature!

Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
npm install socket.io
then 
docker compose run --rm -u root web sh -lc "npm install"


---

### #2  
Then you will need to create a `.env` file with the following contents (default options):

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=alpineedge
DATABASE_URL=postgres://postgres:postgres@db:5432/alpineedge

PORT=3000
NODE_ENV=development
SESSION_SECRET="super duper secret!"
```

---

### #3  
First create node_modules folder:
   docker compose run --rm -u root web sh -lc "npm install"

To run the program, start the containers with the following command:

```bash
docker compose up --build
```

Then open your browser and visit:  
👉 [http://localhost:3000](http://localhost:3000)

**To view logs:**
```bash
docker logs -f alpineedge_web     # App logs
docker logs -f alpineedge_db      # Database logs
```

---

### 🌀 **Auto-Restart Mode (Live Reload) and Normal Mode**

The Docker setup supports two ways to run the app: **development mode** (auto-restart) and **normal mode** (no auto-restart).

---

#### 🧱 **1. Development Mode (Auto-Restart with nodemon)**

In **dev mode**, the server restarts automatically every time you save a file — perfect for active coding sessions.

Start the app in **development mode**:
```bash
docker compose up
```

You should see:
```
[nodemon] starting `node index.js`
✅ Server running on http://localhost:3000
Database connection successful
```

   Now, any time you save a file, nodemon automatically restarts the server.

---

#### 🚀 **2. Normal Mode (No Auto-Restart)**

When you want to run the app normally (without nodemon), temporarily change this line in your `docker-compose.yaml`:

```yaml
command: "npm run dev"
```

to:

```yaml
command: "npm start"
```

Then start normally:
```bash
docker compose up
```

> 💡 This runs the server once, without watching for file changes — useful for demos or performance testing.

To switch back to auto-reload, just revert `npm start` → `npm run dev`.

---

#### 🔁 **Updating Dependencies**

If you install new packages (for example, `npm install express-session`), update inside Docker:
```bash
docker compose run --rm -u root web sh -lc "npm install"
```

This updates `node_modules` inside your project and your `package.json` so everyone gets the same setup.

---

### #4  
Then close it with the following:

```bash
docker compose down
```

If you also want to delete the database volume (to reset data):
```bash
docker compose down -v
```

---

### 🧰 **Optional Developer**

| Command | Description |
|----------|-------------|
| `docker compose restart web` | Restart only the Node.js container |
| `docker exec -it alpineedge_db psql -U postgres -d alpineedge` | Access PostgreSQL shell inside the container |
| `docker compose logs -f` | View all container logs in real time |
| `npm run dev` | Run server with nodemon for hot reload (outside Docker) |

---

### 🪄 **Tips**
- The database initializes from any `.sql` files placed inside the `init_data/` directory.  
- You can modify your `.env` safely without rebuilding Docker images (just restart with `docker compose restart`).  
- Keep your `.env` file **out of version control** by adding it to `.gitignore`.


Connect to DB:
docker exec -it alpineedge_db psql -U postgres -d alpineedge