<div align="center">

<!-- Banner / Logo -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=FeatureHub&fontSize=70&fontColor=fff&animation=fadeIn&fontAlignY=35&desc=AI-Powered%20Feature%20Feedback%20System&descAlignY=55&descSize=20" width="100%"/>

<br/>

<!-- Badges -->
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![HackByte](https://img.shields.io/badge/HackByte-4.0-FF6B6B?style=for-the-badge)](https://hackbyte.in/)

<br/>

> 🚀 **Built at HackByte 4.0** — An intelligent, AI-augmented feedback platform that transforms how teams collect, analyze, and prioritize product feature requests using Google Gemini AI and immersive 3D visualizations.

<br/>

[**✨ Live Demo**](https://hack-byte-4-0.vercel.app/) · [**🐛 Report Bug**](https://github.com/pr1yansh-01/HackByte__4.0/issues) · [**💡 Request Feature**](https://github.com/pr1yansh-01/HackByte__4.0/issues)

</div>

---

## 📋 Table of Contents

- [🌟 About the Project](#-about-the-project)
- [🎯 Problem Statement](#-problem-statement)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Implementation Details](#️-implementation-details)
- [🤖 AI Integration](#-ai-integration)
- [🎨 3D Visualization](#-3d-visualization)
- [👥 Contributors](#-contributors)
- [📄 License](#-license)

---

## 🌟 About the Project

**FeatureHub** is a modern, AI-powered feature feedback system built during **HackByte 4.0**. It bridges the gap between users and product teams by providing an intelligent platform for submitting, analyzing, and prioritizing feature requests — all enhanced by Google's Gemini AI and stunning Three.js 3D visuals.

Traditional feedback tools are passive and manual. FeatureHub is **smart, beautiful, and actionable**.

---

## 🎯 Problem Statement

Product teams are overwhelmed with unstructured user feedback scattered across channels. Key challenges include:

- 🔴 **No intelligent triage** — teams waste hours manually reading and categorizing feedback
- 🔴 **Poor visualization** — flat lists don't convey priority or impact
- 🔴 **No actionable insights** — raw feedback rarely translates to decisions
- 🔴 **User disengagement** — clunky forms lead to low submission rates

FeatureHub solves all of these with AI analysis and immersive UX.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI-Powered Analysis** | Gemini AI automatically categorizes, scores, and summarizes each feedback item |
| 🌐 **3D Interactive Dashboard** | Three.js powered 3D visualizations for feature priority mapping |
| ⚡ **Real-time Processing** | Instant AI feedback analysis on submission |
| 📊 **Smart Prioritization** | AI ranks features by impact, feasibility, and user demand |
| 🎨 **Modern UI/UX** | Sleek, responsive interface built with Tailwind CSS |
| 📱 **Fully Responsive** | Works seamlessly on all devices |
| 🔒 **Type-Safe** | End-to-end TypeScript for reliability |

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| ⚛️ **Next.js** | 14.0.4 | React framework with App Router & SSR |
| 🔷 **TypeScript** | 5.3.3 | Type safety & developer experience |
| 🎨 **Tailwind CSS** | 3.3.6 | Utility-first styling |
| 📦 **React** | 18.2.0 | UI component library |

### 3D & Visualization
| Technology | Version | Purpose |
|---|---|---|
| 🔺 **Three.js** | r160 | 3D rendering engine |
| 🎯 **@react-three/fiber** | 8.15.16 | React renderer for Three.js |
| 🧩 **@react-three/drei** | 9.96.1 | Three.js helper components |

### AI & Intelligence
| Technology | Version | Purpose |
|---|---|---|
| 🤖 **Google Generative AI** | 0.24.1 | Gemini AI for feedback analysis |

### Dev Tools
| Technology | Version | Purpose |
|---|---|---|
| 🔧 **PostCSS** | 8.4.32 | CSS transformations |
| 📝 **ESLint** | — | Code quality & linting |

</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Feedback   │  │  3D Canvas  │  │   Dashboard     │  │
│  │    Form     │  │  (Three.js) │  │   (Analytics)   │  │
│  └──────┬──────┘  └─────────────┘  └─────────────────┘  │
│         │                                                 │
└─────────┼───────────────────────────────────────────────┘
          │ HTTP Request
          ▼
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS SERVER (App Router)             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              API Routes  (/api/*)                   │ │
│  │  ┌──────────────────┐  ┌──────────────────────────┐ │ │
│  │  │  /api/feedback   │  │    /api/analyze          │ │ │
│  │  └────────┬─────────┘  └────────────┬─────────────┘ │ │
│  └───────────┼────────────────────────┼─────────────────┘ │
│              │                        │                  │
│              ▼                        ▼                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           Google Gemini AI SDK                      │ │
│  │       (Categorize · Score · Summarize)              │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher
- **npm** or **yarn**
- A **Google Gemini API Key** — [Get one here](https://aistudio.google.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pr1yansh-01/HackByte__4.0.git
   cd HackByte__4.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser** and visit [http://localhost:3000](http://localhost:3000) 🎉

### Build for Production

```bash
npm run build
npm run start
```

---

## ⚙️ Implementation Details

### Feedback Flow

```
User Submits Feedback
        │
        ▼
  Input Validation
        │
        ▼
  Gemini AI Analysis ──── Categorization
        │               ├── Sentiment Score
        │               ├── Priority Ranking
        │               └── Summary Generation
        ▼
  Store Processed Feedback
        │
        ▼
  Update 3D Dashboard Visualization
        │
        ▼
  Display Results to User
```

### Key Implementation Choices

- **App Router (Next.js 14)** — Used for file-based routing, server components, and API routes, giving us the best of SSR and CSR in a single framework.
- **Server-Side AI Calls** — Gemini API calls are made server-side via API routes to protect API keys and avoid rate-limit issues.
- **React Three Fiber** — Instead of raw Three.js imperative code, we use R3F's declarative React API which integrates cleanly with Next.js state management.
- **TypeScript everywhere** — All components, API handlers, and utility functions are strictly typed for zero runtime surprises.

---

## 🤖 AI Integration

FeaturePulse uses **Google Gemini 1.5** to power its intelligence layer:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeFeedback(feedback: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this product feature feedback and return:
    1. Category (UI/Performance/Feature/Bug)
    2. Priority score (1-10)
    3. Sentiment (positive/neutral/negative)
    4. One-line summary
    
    Feedback: "${feedback}"
    
    Respond in JSON format only.
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

### What Gemini Does

- **Categorization** — Automatically tags feedback (UI, Performance, Feature Request, Bug Report)
- **Sentiment Analysis** — Detects tone and urgency from user language
- **Priority Scoring** — Rates each feature request 1–10 based on impact signals
- **Smart Summaries** — Condenses verbose feedback into single actionable sentences

---


## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

⭐ **Star this repo if you found it helpful!** ⭐

</div>
