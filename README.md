# Finance Planner PRO

AI-powered personal finance planner with budgeting, expense tracking, financial goals, calendar, reports, and intelligent financial advisor.

## Features

- 💰 Income & Expense Tracking
- 📊 Budget Management
- 📅 Financial Calendar
- 🎯 Goals & Achievements
- 🤖 AI Financial Advisor
- 📈 Financial Reports
- 🛒 Shopping List
- 📱 Mobile-first Interface

## Getting Started

```bash
# Start the server (requires NVIDIA API key for AI advisor)
export NVIDIA_API_KEY="nvapi-your-key-here"
cd frontend && python server.py
```

Open http://localhost:8000 in your browser.

## Tech Stack

- Vanilla JavaScript (no frameworks)
- CSS with dark/light theme support
- LocalStorage for data persistence
- NVIDIA Llama API for AI financial advice
- Python HTTP server with built-in API proxy

## Project Structure

```
frontend/
├── index.html              # Entry point
├── styles.css              # Full CSS design system
├── config.js               # API keys configuration
├── server.py               # Dev server + API proxy
├── app.js                  # Core app logic (state, navigation)
├── screens/                # Screen modules
├── shared/                 # Shared utilities & components
└── assets/                 # Static assets
```
