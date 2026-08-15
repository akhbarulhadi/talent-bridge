# 🌉 Talent Bridge — Data Center & Tech Talent Platform

> **Bridging Batam's Digital Skills Gap & Connecting Local Talent with Singapore–Batam Tech Opportunities.**

---

## 🎯 Problem & Solution Alignment

### Problem Statement
Batam's rapid growth as a regional data center hub creates a critical shortage of specialized technical talent—including Data Center Technicians, Cybersecurity Analysts, Infrastructure Engineers, and Cloud Operations Specialists. Traditional educational curricula lag behind fast-moving industry requirements, restricting local workforce mobility and limiting growth despite close proximity to Singapore's tech ecosystem.

### Solution Statement
**Talent Bridge** provides an end-to-end digital ecosystem that directly solves the talent gap through three core pillars:
1. **Interactive Hands-on Simulations (Micro-Credentialing)**: Immersive 2D scenario-based simulations (e.g., Phaser 2D Data Center server room & SOC incident handling) that test and certify practical incident response and technical troubleshooting skills.
2. **AI-Powered Automated Resume Parser**: Automated OCR parsing and AI skill mapping that standardizes local talent profiles into verified micro-credentials.
3. **Regional HR Talent Matching & Direct Messaging**: Connects Singapore and Batam HR recruiters with job-ready candidates based on verified simulation scores and AI job-fit matching, enabling direct outreach and recruitment.

---

## 🚀 Key Features

- 🎮 **2D Data Center Simulation Engine**: Built with Phaser & React, placing talents into real-world server room and SOC incident response scenarios.
- 📊 **Dynamic Skill Scoring & Leaderboard**: Real-time evaluation of decision tree choices with persistent profile score updates.
- 📑 **AI Resume Parser (OCR)**: Automatic extraction of skills, experience, and certifications from candidate CVs.
- 🤝 **Talent-Job Match Engine**: Automated match-percentage calculation between candidate skills and active Singapore/Batam job postings.
- 💼 **HR Enterprise Portal**: Complete job listing management, talent pool filtering, direct candidate messaging, and automated email notifications via Nodemailer.
- 🌐 **Full English Localization**: Standardized internationalization for cross-border recruitment between Singapore and Indonesia.

---

## 🛠️ Technology Stack

- **Frontend Core**: Next.js (App Router), React 18, TypeScript, Tailwind CSS
- **Game & Interactive UI**: Phaser 3/4 Engine, GSAP (GreenSock), Material Symbols, Lucide React
- **State Management**: Zustand
- **Backend & Database**: Supabase (PostgreSQL, Auth, Row Level Security, Storage)
- **API & Messaging**: Next.js Serverless API Routes, Nodemailer
- **AI Microservice**: Python Flask, RapidOCR (ONNX Runtime)

---

## ⚙️ Installation & Setup Guide

### 1. Prerequisites
- Node.js (v18.x or higher)
- npm / yarn / pnpm
- Supabase Account & Project

### 2. Clone & Install Dependencies

```bash
git clone https://github.com/your-repo/talent-bridge.git
cd talent-bridge
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Email Notification Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```