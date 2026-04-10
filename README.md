# GrantIQ 🎯🚀

> **GrantIQ features a custom-built AI Agent to fully automate the complex application processes for Government Schemes and Grants!**

GrantIQ is an advanced Opportunity Intelligence platform explicitly designed to seamlessly connect startups, MSMEs, and enterprises with the right government schemes and operational grants. Going beyond just searching, GrantIQ integrates an autonomous bot that actively fills multi-step regional and national application forms (like KSB and Gujarat subsidies) entirely via AI automation.

## 🌟 Key Features

* **🤖 Autonomous Application Agent**: An integrated AI Playwright Engine directly injects user data schemas onto external government web forms, intelligently bypassing static CAPTCHAs and passwords, formatting sensitive data (like 16-digit account numbers into split array boxes), and overriding complex DOM restrictions.
* **🧠 NLP Semantic Matching Engine**: A highly tuned backend algorithm running SentenceTransformers (ll-MiniLM-L6-v2) locally to perform Cosine Similarity matches on user business profiles against a sprawling MongoDB array of available Government Schemes.
* **💬 Context-Aware Dashboard AI Chatbot**: Users get a floating AI assistant strictly bonded to their business context and scheme recommendations, answering dynamic questions seamlessly within the dashboard layer via the /chat route.
* **📊 PowerBI-Style Analytics Dashboard**: A visually striking, real-time analytics hub using Recharts and PapaParse to monitor simulated company metrics (like R&D vs. Marketing Spend, growth tracking, and regional tracking) rendered through beautiful modern graphs.
* **⚡ Sophisticated React UI/UX**: Utilizing ramer-motion and Tailwind CSS, the platform operates on professional React Router paradigms (/onboard, /schemes, /dashboard), complete with complex state management, sleek routing animations, and beautiful data visualization aesthetics.
* **🕸️ Proprietary Web Scrapers**: Python backend scrapers built with BeautifulSoup / Playwright mapping complex government portals into a unified dataset.

## 🏗️ Architecture & Tech Stack

### Frontend Hub (/frontend)
*   **Framework**: React.js with Vite
*   **Routing**: React Router DOM
*   **Design/Animations**: Tailwind CSS, Framer Motion, Lucide React
*   **Data Visualization**: Recharts, PapaParse (for client-side CSV processing)

### The Automation Layer (/backend)
*   **Runtime**: Node.js / Express.js
*   **Database Integration**: MongoDB (Mongoose Schema)
*   **AI Agent**: Playwright Headless Automation (the 	estRunner.js core handles injection logic, decoupled execution, parsing specific structures like PPO keys and banking digit constraints).

### AI Semantic & Recommendation Backend (matching_engine.py)
*   **Server**: FastAPI / Uvicorn
*   **Machine Learning**: sentence-transformers for calculating dense cosine similarities mapping Q&A / Business profile contexts securely to user queries.

---

## ⚙️ Getting Started

### 1. Launch the React Frontend
Navigate to the rontend directory, install dependencies, and start Vite.
`ash
cd frontend
npm install
npm run dev
`

### 2. Boot the Automation Backend
Navigate to the ackend directory to run the Express bridge handling the autonomous application forms.
`ash
cd backend
npm install
node server.js
`

### 3. Initialize the AI Matching Engine (Python)
Navigate to the root directory, activate your virtual environment, and boot FastAPI.
`ash
pip install fastapi uvicorn sentence-transformers scikit-learn pymongo motor
python matching_engine.py
`

## 🧭 Navigating the App
The entire architecture is modularized strictly over routing to enforce professional scale:
*   / : The Landing Interface.
*   /onboard : Multi-step Wizard collecting enterprise structure details, regions, and metrics.
*   /schemes : The AI Semantic matched schemes. Start interacting with the Autopilot Agent here by clicking "**Fill through Agent**".
*   /dashboard : Explore your CSV-mapped metrics, and engage with the bound AI Contextual Chatbot.

---
*Built with execution at scale in mind. Making public subsidies completely frictionless.*
