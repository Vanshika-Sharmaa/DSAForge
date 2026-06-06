<div align="center">

# ⚡ DSAForge

### AI-Powered Data Structures & Algorithms Learning Platform

*Visualize · Practice · Play · Master*

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge)

</div>

---

## 📌 About

**DSAForge** is an all-in-one, AI-powered platform that transforms how you learn DSA. Instead of reading theory alone, you can **see** algorithms animate, **practice** real problems with smart hints, **analyze** your own code with AI, and **play** your way through concepts in game mode — all from a single app.

---

## ✨ Features

### 🛠️ Visualizer Tools
- **Sorting Visualizer** — Animate Bubble, Selection, Insertion, Merge & Quick Sort in real-time with speed control
- **Search Visualizer** — Step-by-step Linear & Binary Search animation
- **Graph Traversal** — Interactive BFS & DFS on custom-built graphs
- **Big-O Complexity** — Side-by-side complexity comparison chart for all major algorithms

### 🤖 AI-Powered
- **AI Code Analyzer** — Paste any code and get instant time/space complexity breakdown powered by Groq (LLaMA 3)
- **Smart Hint System** — Progressive hints that guide without spoiling
- **Post-Solve Analysis** — Detailed feedback after every problem attempt

### 🎮 Gaming & Practice
- **Practice Mode** — 100+ curated DSA problems with timer, hints, voice support & spaced repetition
- **Vice City Mode** — GTA-style fullscreen game where you complete missions & beat bosses by answering DSA questions
- **Memory Arcade** — Flashcard-style memory trainer to lock in DSA concepts

### 🔧 Smart Utilities
- **Code Playground** — Write, run and analyze code directly in the browser
- **Voice Toggle** — Hands-free mode using Web Speech API
- **History Tracker** — Full log of your solved problems and sessions
- **Smart Timer Widget** — Per-problem time tracking with optimal time benchmarks
- **Mistake Tracker** — Logs weak areas for focused revision

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| AI Provider | Groq SDK — LLaMA 3 |
| Fonts | JetBrains Mono, Syne |
| Build Tool | Vite with HMR |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A free [Groq API Key](https://console.groq.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/DSAForge.git
cd DSAForge

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Add your GROQ_API_KEY in the .env file

# 4. Start the backend server
npm run server

# 5. Start the frontend (new terminal)
npm run dev
```

Open **http://localhost:5173** in your browser 🚀

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ Never push your `.env` file. It is already listed in `.gitignore`.

Get your free API key at → [console.groq.com](https://console.groq.com)

---

## 📁 Project Structure

```
DSAForge/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── AIAnalyzer.jsx
│   │   ├── SortVisualizer.jsx
│   │   ├── GraphVisualizer.jsx
│   │   ├── CodePlayground.jsx
│   │   ├── SmartHintSystem.jsx
│   │   └── ...
│   ├── pages/             # Full page views
│   │   ├── Gamemodepage.jsx
│   │   ├── Memorypage.jsx
│   │   ├── Practicepage.jsx
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Helper functions (AI, voice, timer, memory)
│   └── data/              # Question bank & algorithm data
├── routes/                # Express API routes
├── server.js              # Express backend
├── .env.example           # Environment variable template
└── vite.config.js
```

---

## 📄 License

MIT © 2026 — Made with ❤️ by **Vanshika Sharma**