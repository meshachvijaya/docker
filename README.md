**Assumed setup:** WebStorm, Docker Desktop running, Node.js installed locally.

---

**Step 1 — Create your project folder structure**

Open Windows Terminal:
```bash
mkdir docker-project
cd docker-project
mkdir frontend backend
```

---

**Step 2 — Scaffold the frontend**

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
cd ..
```

---

**Step 3 — Scaffold the backend**

```bash
cd backend
npm init -y
npm install express pg dotenv
npm install -D nodemon
cd ..
```

Create `backend/index.js`:
```js
const express = require('express')
const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(3000, () => console.log('Backend running on port 3000'))
```

Add to `backend/package.json` scripts:
```json
"scripts": {
  "dev": "nodemon index.js"
}
```

---

**Step 4 — Create docker-compose.yml at the root**

```bash
cd docker-project
```

Create `docker-compose.yml`:
```yaml
services:
  frontend:
    image: node:22-alpine
    working_dir: /app
    volumes:
      - ./frontend:/app
    ports:
      - "5173:5173"
    command: sh -c "npm install && npm run dev -- --host"

  backend:
    image: node:22-alpine
    working_dir: /app
    volumes:
      - ./backend:/app
    ports:
      - "3000:3000"
    command: sh -c "npm install && npm run dev"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://myuser:mypassword@db:5432/mydb

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:

```
Folder structure should now look like this:
```
docker-project/
├── docker-compose.yml
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── index.js
    └── package.json
```

---

**Step 5 — Open in WebStorm and spin up**

Open WebStorm → Open folder → select `docker-project`. Then in terminal:

```bash
docker compose up
```

You'll see Docker pulling images on first run (takes a minute), then all three services start. After that:

- Frontend → `http://localhost:5173`
- Backend → `http://localhost:3000/api/health`
- PostgreSQL → `localhost:5432` (connect via WebStorm's database panel)

---

**Step 6 — Connect WebStorm to the database**

In WebStorm: `View → Tool Windows → Database` → click `+` → PostgreSQL → fill in:
- Host: `localhost`
- Port: `5432`
- User: `myuser`
- Password: `mypassword`
- Database: `mydb`

Click Test Connection — should go green. Now you can browse tables, run SQL, all from inside WebStorm.

---

**Step 7 — Test your API**

While containers are running, open a new terminal tab:
```bash
curl http://localhost:3000/api/health
# {"status":"ok"}
```

Or use WebStorm's built-in HTTP client — create a file called `test.http`:
```
GET http://localhost:3000/api/health
```
Click the green play button next to it.

---

**Step 8 — Make a code change and see hot reload**

Edit `backend/index.js` — add a new route:
```js
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Docker!' })
})
```

Save it. Nodemon inside the container detects the file change via the volume mount and restarts automatically. Hit `http://localhost:3000/api/hello` — it's live, no `docker compose restart` needed.

Same for the frontend — edit any React component, Vite's hot reload picks it up instantly in the browser.

---

**Step 9 — Stopping and resuming**

```bash
# Stop everything (keeps your DB data)
docker compose down

# Next day, resume exactly where you left off
docker compose up
```

Your PostgreSQL data survives because it's stored in the `pgdata` named volume, not inside the container.

---

**Step 10 — When a teammate clones your project**

They just need Docker Desktop installed, then:
```bash
git clone your-repo
cd docker-project
docker compose up
```

Everything works identically on their machine. No "works on my machine" problems.

---