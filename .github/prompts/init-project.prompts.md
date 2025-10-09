# 🎨 AI Prompt: Frontend Scaffold for Companion Collecting Game  

You are an expert frontend architect. I want you to **scaffold a frontend project** for a mobile-first web app (can later be wrapped with Capacitor or React Native). The backend is built with **Laravel 12**, REST APIs, and **Laravel Reverb (WebSockets)** for realtime.  

---

## 📦 Stack
- **Framework**: Nuxt 4
- **State Management**: Pinia  
- **Authentication**: @sidebase/nuxt-auth with local provider
- **UI Library**: TailwindCSS (with dark/light theme support)  
- **Realtime**: Laravel Reverb client (Echo-compatible)  
- **Maps**: Leaflet (or Mapbox if needed)  

---

## 🔑 Requirements

### 1. Project Setup
- Initialize Nuxt project with TypeScript.  
- Add TailwindCSS & configure dark/light themes.  
- Setup Pinia for global state.  
- Configure `.env` for backend API base URL and WebSocket connection.  

### 2. Authentication
- Install and configure **@sidebase/nuxt-auth** with local provider strategy.
- Configure auth module in `nuxt.config.ts` with:
  - **Local provider** pointing to Laravel backend endpoints
  - **Session strategy** with JWT token handling
  - **Auto-refresh** token mechanism
- API endpoints (already available in backend):  
  - `POST /auth/login` → login user  
  - `POST /auth/register` → register user  
  - `GET /me` → fetch current user  
  - `POST /auth/logout` → logout user
- Configure runtime config for:
  - `AUTH_ORIGIN` (frontend URL)
  - `NUXT_AUTH_SECRET` (JWT secret)
  - `API_BASE_URL` (Laravel backend URL)
- Use `$auth` composable for:
  - Login/logout functionality
  - Session management  
  - User data access
  - Protected route middleware
- Implement middleware for route protection (`auth.ts`).  

### 3. Map Integration
- Use **Leaflet** to display world map.  
- Fetch spawns from backend via:  
  - `GET /map/companions?lat=x&lng=y`  
- Render:  
  - **Normal state** → companions inside capture radius  
  - **Shadow state** → companions outside radius (use grayscale or opacity styling)  

### 4. Capture Companions
- API integration:  
  - `POST /companions/{id}/capture`  
- Show modal/animation on capture.  
- Update user’s inventory in state (`user_companions`).  

### 5. Quests
- API integration:  
  - `GET /quests` → list active quests  
  - `POST /quests/{id}/complete` → complete quest  
- Display **daily + upcoming quests** in a dashboard page.  
- Track progress visually (progress bar).  

### 6. Badges
- API integration:  
  - `GET /badges` → list user’s badges  
- Show **companion-specific Tracker Badges** (e.g. "Flufftail Tracker Badge").  
- Display **levels (I–V)** with milestone progress.  

### 7. WebSockets (Realtime with Laravel Reverb)
- Connect with Echo/Reverb client.  
- Listen for events:  
  - `spawn:new` → new companion spawn in user’s grid/cell  
  - `spawn:despawn` → remove companion from map  
  - `quest:update` → update user quest progress  
- On events, update map state and UI instantly.  

### 8. UI Pages
- **Login/Register**  
- **Map** (main gameplay)  
- **Companion Inventory** (list of captured companions)  
- **Quests** (daily/upcoming with progress)  
- **Badges** (earned + locked tracker badges)  
- **Profile/Settings**  

---

## 📡 Deliverables from AI
1. Scaffolded **Nuxt + Tailwind + Pinia** project.  
2. Configured **@sidebase/nuxt-auth** with local provider for Laravel backend.
3. **API client** with automatic auth token handling via auth module.  
4. **Auth middleware** and protected route examples.
5. **Leaflet map** with companion rendering logic.  
6. Example **WebSocket event handlers** (`spawn:new`, `spawn:despawn`, etc.).  
7. Sample components for **quests & badges**.  
8. Best practices for **scaling realtime map data** (debouncing location updates, chunk-based map loading).  

---

👉 Generate everything as if building a **ready-to-play MVP frontend**, but modular and clean enough to scale.  
