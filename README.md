# ⚡ Build Without Building

An interactive, gamified live hackathon and architecture competition platform powered by React, TypeScript, TailwindCSS/Vanilla CSS, Node.js, and MongoDB Atlas.

---

## 🏆 Tournament Structure (3-Round Championship)

- **Round 1: Open Qualifier** (No Elimination)
  - All registered squads advance to Round 2.
- **Round 2: Problem Statement Showdown** (Top 8 Qualify)
  - 8 distinct challenge tracks with a maximum capacity of 2 teams per problem statement.
  - The Top 8 ranked teams advance to the Grand Finals.
- **Round 3: Grand Finals** (Top 4 Prized)
  - 🥇 **1st Place**: Tournament Champion (1 Team)
  - 🥈 **2nd Place**: Runner-Up Silver Laureate (1 Team)
  - 🥉 **3rd Place**: Dual Bronze Joint Winners (2 Teams)

---

## 🎮 Features

- **7-Stage Event Flow Pipeline**: Lobby ➔ Problem Reveal ➔ Card Reveal (3 Tech Stack Draft) ➔ 15m Build Phase ➔ Live Pitch & Defense ➔ Judging Deliberation ➔ Leaderboard & 3D Podium Reveal.
- **Real-Time Sync**: Server-Sent Events (SSE) + fast polling fallback automatically synchronizes Player Dashboards, Judge Consoles, Host Controls, and the Stadium Projector in real time.
- **Web Audio Soundscape**: Zero-dependency synthesized audio cues for countdown ticks, buzzers, phase whooshes, and victory fanfares.
- **Stadium Visuals**: Canvas confetti engine, qualification modals, and 3D animated victory podiums.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Full Application (Client + Backend API)
```bash
npm run dev:full
```

- **Client Application**: `http://localhost:5173`
- **Backend API & SSE Server**: `http://localhost:3001`
- **Host Dashboard**: `http://localhost:5173/host/login` (Default: `host@event.com` / `pass@123`)
- **Judge Portal**: `http://localhost:5173/judge/login`
- **Stadium Projector**: `http://localhost:5173/projector`

### 3. Production Build
```bash
npm run build
```
