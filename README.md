# SplitsVilla

SplitsVilla is a full-stack group travel and expense management app.

## Folder Structure

```
SplitsVilla/
	frontend/   # React + Vite app
	backend/    # Express + MongoDB API
	package.json
	render.yaml
```

## Local Development

1. Install all dependencies from root:

```bash
npm run install:all
```

2. Create environment file:

```bash
cp backend/.env.example backend/.env
```

3. Run backend:

```bash
npm run dev:backend
```

4. Run frontend (separate terminal):

```bash
npm run dev:frontend
```

Frontend runs on `http://localhost:8080` and proxies `/api` to backend `http://localhost:5000`.

## Root Commands

```bash
npm run install:all      # install frontend + backend dependencies
npm run build            # build frontend only
npm run render-build     # Render build command (installs + builds)
npm run start            # start backend (serves frontend/dist in production)
```

## Render Deployment (Single Service)

This repo is configured for one Render web service where:

1. `npm run render-build` builds the frontend into `frontend/dist`
2. `npm run start` starts Express backend
3. In production, backend serves static files from `frontend/dist`
4. API remains available at `/api/*`

You can use `render.yaml` in this repo or set these manually:

- Build Command: `npm run render-build`
- Start Command: `npm run start`

Set these environment variables in Render:

- `NODE_ENV=production`
- `MONGO_URI` (MongoDB Atlas connection string)
- `JWT_SECRET`
- `CLIENT_URLS` (include your Render URL)
- `EMAIL_USER` (optional)
- `EMAIL_PASSWORD` (optional)
- `ANTHROPIC_API_KEY` (optional)

## MongoDB Atlas

Set your Atlas URI in `MONGO_URI`, for example:

```text
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/splitsvilla?retryWrites=true&w=majority
```

## Important Note About Uvicorn

`uvicorn` runs Python ASGI apps (FastAPI/Starlette). This project backend is Node.js (Express), so it cannot be run with `uvicorn` unless the backend is rewritten in Python.

For this Node setup, the one-command production entrypoint is:

```bash
npm run start
```
