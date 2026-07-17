# Finance Planner PRO

AI-powered personal finance planner with budgeting, expense tracking, financial goals, calendar, reports, and intelligent financial advisor.

## Features

- 💰 Income & Expense Tracking
- 📊 Budget Management (daily, weekly, monthly views)
- 📅 Financial Calendar with events
- 🎯 Goals & Achievements with gamification
- 🤖 AI Financial Advisor (NVIDIA Llama API)
- 📈 Financial Reports & Charts
- 🛒 Shopping List
- 💳 Debt Tracker with payoff progress
- 🔥 Daily streak & XP system
- 🏆 Achievement system (14 achievements)
- 📱 Progressive Web App (installable, offline-capable)
- 🌓 Dark/Light theme

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/crissuboy-arch/Finance-Planner-PRO.git
cd Finance-Planner-PRO

# 2. Set your NVIDIA API key (get one at https://build.nvidia.com/)
export NVIDIA_API_KEY="nvapi-your-key-here"

# 3. Start the server
cd frontend && python server.py
```

Open http://localhost:8000 in your browser.

> **Note:** Create `frontend/config.js` from `frontend/config.example.js` with your actual NVIDIA API key.

## PWA Installation

Finance Planner PRO is a Progressive Web App:

- **Desktop (Chrome/Edge):** Click the install icon in the address bar
- **iOS (Safari):** Share → Add to Home Screen
- **Android (Chrome):** Add to Home Screen from the menu
- **Offline:** Cached pages and scripts work without internet

## Responsive Support

| Breakpoint | Target | Layout |
|-----------|--------|--------|
| 320px+ | Small phones | Single column, compact |
| 375px+ | Modern phones | Optimized touch targets |
| 600px+ | Tablets | Multi-column grids |
| 1024px+ | Desktop | Centered card layout |
| 1440px+ | Wide screens | Expanded containers |
| 2560px+ | 4K | Max 1600px content |

Landscape mode on mobile is fully supported with compact navigation.

## Tech Stack

- **Vanilla JavaScript** (IIFE pattern, no frameworks)
- **CSS** with custom properties, `clamp()` fluid sizing, dark/light theme
- **LocalStorage** for data persistence
- **NVIDIA Llama API** for AI financial advice
- **Python HTTP server** with built-in API proxy
- **Service Worker** for offline caching

## Project Structure

```
Finance-Planner-PRO/
├── README.md
├── CHANGELOG.md
├── .gitignore
├── frontend/
│   ├── index.html              # Entry point
│   ├── styles.css              # Responsive design system
│   ├── config.js               # API keys (gitignored)
│   ├── config.example.js       # API key template
│   ├── manifest.json           # PWA manifest
│   ├── service-worker.js       # Offline caching
│   ├── server.py               # Dev server + API proxy
│   ├── app.js                  # Core: state, navigation, gamification
│   ├── screens/                # Screen modules (13 screens)
│   ├── shared/                 # Utilities & components
│   └── assets/                 # Icons, splash screens
```

## Release

**Current version:** v1.0.0

See [CHANGELOG.md](CHANGELOG.md) for release history.
