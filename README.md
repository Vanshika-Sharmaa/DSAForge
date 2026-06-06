# DSA Algorithm Analyzer — AI Powered

A full-stack interactive DSA visualizer and AI-powered code analyzer built with React + Express + Claude API.

## Features

- **Sorting Visualizer** — Bubble, Selection, Insertion, Merge, QuickSort with live animations
- **Search Visualizer** — Binary & Linear search step-by-step  
- **Graph Traversal** — BFS & DFS visualization on interactive graphs
- **Big-O Complexity Chart** — Interactive reference chart for all major algorithms
- **Code Playground** — Run DSA code in-browser with 6 templates
- **AI Analyzer** — Claude-powered complexity analysis, dry runs, and optimization tips
- **History** — Track all analyses and visualizations

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set your Anthropic API key
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
# Or create a .env file (copy .env.example)
```

### 3. Run backend (Terminal 1)
```bash
npm run server
```

### 4. Run frontend (Terminal 2)
```bash
npm run dev
```

### Or run both together
```bash
npm start
```

Open http://localhost:5173

## Architecture

```
DSA_ALGO_ANALYZER/
├── server.js              # Express backend + Claude API
├── routes/analyze.js      # Static analysis fallback
├── src/
│   ├── api.js             # Frontend API client (native fetch)
│   ├── App.jsx            # Root with routing + state
│   ├── components/
│   │   ├── AIAnalyzer.jsx     # AI chat interface
│   │   ├── SortVisualizer.jsx # Sorting bars
│   │   ├── SearchVisualizer.jsx
│   │   ├── GraphVisualizer.jsx
│   │   ├── ComplexityChart.jsx
│   │   ├── CodePlayground.jsx
│   │   └── Sidebar.jsx
│   ├── pages/             # Page wrappers
│   ├── hooks/
│   │   ├── useSort.js     # Sorting animation state
│   │   └── useSearch.js
│   └── utils/
│       ├── analyzer.js    # Local pattern detection
│       ├── algoData.js    # Algorithm metadata
│       └── history.js     # localStorage history
└── vite.config.js         # Dev proxy → backend
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/api/analyze` | AI-powered analysis via Claude |
| POST | `/api/static-analyze` | Fast pattern detection (no AI) |
