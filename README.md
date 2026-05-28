# 🧚 MediMentor — AI Health Triage Assistant

<p align="center">
  <img src="https://cdn.abacus.ai/images/fdc6adb3-7d74-4c98-8b78-7cab6aa39f03.png" alt="Pipi - MediMentor Mascot" width="120" />
</p>

<p align="center">
  <strong>AI-powered medical triage agent that routes symptoms to 15 medical specialties</strong>
</p>

<p align="center">
  <a href="https://medimentor-nextjs-vxz5vm.abacusai.app">🌐 Live Demo</a> •
  <a href="https://devpost.com/software/medimentor-npt4gl">📋 Devpost</a>
</p>

---

## 📖 Overview

MediMentor is an AI-powered health information chatbot featuring **Pipi (ピピ)**, a fairy character who provides general health guidance. Users describe their symptoms, and the AI automatically routes them to one of **15 medical specialties** — from internal medicine to mental health — providing relevant health information while strictly complying with Japan's Medical Practitioner Act.

> ⚠️ MediMentor provides **general health information only** and does not diagnose, treat, or prescribe. Always consult a medical professional.

## ✨ Features

### 🏥 Core
- **15-Specialty Triage** — AI routes symptoms to the appropriate department (Internal Medicine, Pediatrics, Cardiology, Mental Health, etc.)
- **Fairy Character "Pipi"** — Friendly, approachable AI persona (not a doctor) with specialty-themed avatars
- **Legal Compliance** — Strict adherence to Japanese Medical Practitioner Act (医師法第17条)
- **Emergency Detection** — Automatically detects critical symptoms and displays emergency contact info
- **Confidence Score & References** — Each response includes confidence level and cited sources

### 🌐 Multilingual
- **5 Languages** — Japanese, English, Spanish, Chinese, Korean
- **Cross-Language Translation** — Send messages in any language; get responses + translation to your UI language
- **On-Demand Translation** — Translate any past message with one click

### 🎙️ Voice Input
- **Web Speech API** — Speak your symptoms instead of typing
- **All 5 Languages Supported** — Voice recognition adapts to selected language

### 📋 Health History
- **Automatic Tracking** — Every consultation is saved with specialty, symptoms, and AI summary
- **Timeline View** — Browse past consultations grouped by date at `/health`
- **Summary Stats** — Total consultations, specialties consulted, active days

### 🏥 Hospital Finder
- **Country-Specific Rankings** — Each language shows top 10 hospitals for that country
  - 🇯🇵 Japan — Newsweek 2025
  - 🇺🇸 USA — Newsweek 2025
  - 🇪🇸 Spain — Newsweek 2025
  - 🇨🇳 China — Fudan University Ranking 2023
  - 🇰🇷 South Korea — Newsweek 2025
- **Region Filter** — Filter hospitals by state/prefecture/region
- **Direct Links** — External links to each hospital's official website

### 📱 PWA
- **Installable** — Add to home screen on mobile devices
- **Standalone Mode** — Full-screen app experience

### 💬 Chat Management
- **Session History** — Browse and resume past chat sessions
- **Session Deletion** — Remove chat sessions from history
- **Streaming Responses** — Real-time AI response streaming

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **UI** | React, Tailwind CSS, Framer Motion |
| **AI / LLM** | Claude API, OpenAI API (via Abacus AI) |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js (Credentials) |
| **Voice** | Web Speech API |
| **Deployment** | Abacus AI Platform |

## 📁 Project Structure

```
nextjs_space/
├── app/
│   ├── api/
│   │   ├── chat/          # Main chat endpoint (streaming + health record creation)
│   │   ├── translate/      # On-demand translation API
│   │   ├── health-records/ # Health history API
│   │   ├── sessions/       # Chat session CRUD
│   │   ├── auth/           # NextAuth endpoints
│   │   └── signup/         # User registration
│   ├── health/             # Health history page
│   ├── hospitals/          # Hospital finder page
│   ├── login/              # Login / Signup page
│   └── page.tsx            # Main chat interface
├── components/
│   ├── medimentor-app.tsx  # Main app component
│   ├── chat-message.tsx    # Message bubble + translation
│   ├── chat-input.tsx      # Input field + voice button
│   ├── header.tsx          # Navigation header
│   ├── welcome-screen.tsx  # Landing screen with specialties
│   ├── language-selector.tsx
│   ├── voice-input-button.tsx
│   ├── hospitals-page-content.tsx
│   ├── health-page-content.tsx
│   └── chat-history-sidebar.tsx
├── lib/
│   ├── i18n.ts             # 5-language translations
│   ├── system-prompts.ts   # AI prompts per specialty
│   ├── prisma.ts           # Database client
│   └── auth.ts             # NextAuth config
├── prisma/
│   └── schema.prisma       # Database schema
└── public/
    └── manifest.json       # PWA manifest
```

## 🚀 Demo

**Live**: [https://medimentor-nextjs-vxz5vm.abacusai.app](https://medimentor-nextjs-vxz5vm.abacusai.app)

**Devpost**: [https://devpost.com/software/medimentor-npt4gl](https://devpost.com/software/medimentor-npt4gl)

## 🩺 Supported Specialties

| Specialty | Japanese |
|---|---|
| Mental Health | メンタルヘルス |
| Internal Medicine | 内科 |
| Orthopedics | 整形外科 |
| Pediatrics | 小児科 |
| Pharmacy | 薬剤 |
| Nutrition | 栄養 |
| Dermatology | 皮膚科 |
| Ophthalmology | 眼科 |
| ENT | 耳鼻咽喉科 |
| Urology | 泌尿器科 |
| Gynecology | 婦人科 |
| Cardiology | 循環器科 |
| Neurology | 神経内科 |
| Surgery | 外科 |
| Dentistry | 歯科 |

## ⚖️ Legal Compliance

MediMentor strictly complies with the **Japanese Medical Practitioner Act (医師法第17条)** and **Pharmaceutical and Medical Device Act (薬機法)**:

- ❌ No diagnosis — never states "You have X disease"
- ❌ No treatment instructions — never prescribes specific treatments
- ❌ No prescriptions — never recommends specific medications
- ❌ No definitive referrals — uses "generally, people consult..." phrasing
- ✅ Information only — provides general health knowledge with cited sources
- ✅ Position disclosure — every response reminds users Pipi is not a doctor

## 📄 License

This project was created for a hackathon. All rights reserved.
