# 🏗️ Architecture Document — Talent Bridge Platform

> **System Architecture Specification for Talent Bridge: Data Center & Tech Talent Ecosystem**  
> *Version 1.0.0 | Last Updated: August 16, 2026*

---

## 📋 1. Executive Summary & Product Vision

**Talent Bridge** is an end-to-end digital ecosystem platform engineered to solve the regional **digital skills gap** in Batam and its surrounding tech corridors, specifically targeting high-demand industries such as **Data Center Operations** and **Cybersecurity Operations Center (SOC)**. The platform connects verified local technical talent with cross-border career opportunities across Singapore and Batam.

### 💡 Core Architectural Pillars:
1. **2D Interactive Simulation Engine (Micro-Credentialing)**: Leverages the Phaser 4 game engine seamlessly integrated with React 19 & Zustand to deliver real-world scenario-based assessments (e.g., *Rack Overheating Crisis* & *SOC Incident Response*) driven by a *Directed Acyclic Graph (DAG)* decision tree.
2. **AI-Powered Automated Resume Parser**: A Python-based OCR pipeline (RapidOCR + ONNX Runtime) that extracts and standardizes unstructured PDF resumes into validated skill profiles.
3. **Talent-Job Match Engine & HR Portal**: Algorithmic matching calculating skill-fit percentages between candidate simulation micro-credentials and active employer job postings (HR recruiters in Singapore and Batam).
4. **Outreach & Direct Messaging Network**: Professional networking hub with direct recruiter-candidate messaging and automated SMTP email notifications powered by Nodemailer.

---

## 🏛️ 2. High-Level System Architecture

The Talent Bridge architecture follows a **Modern Serverless & Microservices Hybrid Pattern**, cleanly decoupling the web frontend/BFF layer, 2D game engine, managed backend/auth infrastructure, and external AI microservice.

```mermaid
graph TD
    subgraph Client Layer ["🖥️ User Client Layer (Browser)"]
        TalentUI["Talent Web Portal (Next.js 16 App Router)"]
        HRUI["HR Enterprise Portal (Next.js 16 App Router)"]
        GameCanvas["2D Game Engine (Phaser 4 + GSAP + Zustand)"]
    end

    subgraph BFF Layer ["⚙️ Next.js Serverless API Routes (BFF)"]
        AuthRoute["/api/auth & Auth Middleware"]
        SimRoute["/api/simulation & /api/score"]
        MatchRoute["/api/matching & /api/talents"]
        CVRoute["/api/cv & /api/upload-cv"]
        InboxRoute["/api/inbox & /api/network"]
        MailService["Nodemailer (SMTP Service)"]
    end

    subgraph Data & Auth Layer ["🗄️ Supabase Cloud Platform"]
        SupaAuth["Supabase Auth (JWT & RBAC)"]
        SupaDB[("Supabase PostgreSQL Data Store")]
        SupaStorage["Supabase Storage (CV PDFs Bucket)"]
        SupaRLS["Row Level Security (RLS) Policies"]
    end

    subgraph AI Service Layer ["🧠 External AI Microservice"]
        FlaskAI["Python Flask AI OCR Service"]
        RapidOCR["RapidOCR Engine + ONNX Models"]
    end

    %% Connections
    TalentUI --> GameCanvas
    TalentUI --> AuthRoute
    TalentUI --> SimRoute
    TalentUI --> CVRoute
    HRUI --> MatchRoute
    HRUI --> InboxRoute

    AuthRoute --> SupaAuth
    SimRoute --> SupaDB
    MatchRoute --> SupaDB
    InboxRoute --> SupaDB
    InboxRoute --> MailService

    CVRoute --> SupaStorage
    CVRoute --> FlaskAI
    FlaskAI --> RapidOCR
    FlaskAI --> SupaDB
```

---

## 🛠️ 3. Technology Stack Matrix

| System Layer | Technology / Library | Description & Role |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16.3 (App Router), React 19.2 | Server-side rendering, modular App Router, & interactive UI components |
| **Programming Language** | TypeScript 5.x, JavaScript (ESNext) | Strict static typing ensuring safety across frontend code and API routes |
| **Styling & UI** | Tailwind CSS v4, Lucide React, Material Symbols | Modern glassmorphism design system, dynamic themes, & iconography |
| **2D Game Engine** | Phaser 4.2.1, GSAP 3.15 | 2D canvas renderer for server room environments & SOC threat indicators |
| **State Management** | Zustand 5.0 | Reactive state synchronization between Phaser canvas & React UI overlays |
| **Backend & Auth** | Supabase Auth, PostgreSQL 15 | Role-based authentication (Talent vs HR), RLS, & managed database |
| **API & Messaging** | Next.js API Routes, Nodemailer 9.0 | Serverless API endpoints & SMTP email dispatch for recruiter outreach |
| **AI OCR Microservice** | Python 3.10+, Flask, RapidOCR, ONNX Runtime | PDF resume text detection, skill classification, & ONNX inference |

---

## 📦 4. Subsystem Architecture & Directory Structure

The `talent-bridge` directory layout adheres to Next.js App Router conventions:

```
talent-bridge/
├── app/
│   ├── api/                      # Serverless API Endpoints
│   │   ├── cv/                   # CV text extraction endpoint
│   │   ├── inbox/                # HR-Talent messaging endpoint
│   │   ├── jobs/                 # HR job posting management endpoint
│   │   ├── matching/             # Talent-job matching engine endpoint
│   │   ├── network/              # Professional connection network endpoint
│   │   ├── score/                # Talent simulation score update endpoint
│   │   ├── simulation/           # Scenario DAG tree & decision fetch endpoint
│   │   ├── talents/              # Talent pool directory & filter endpoint
│   │   ├── titles/               # Master job role / track endpoint
│   │   └── upload-cv/            # Resume PDF upload endpoint (Supabase Storage)
│   ├── components/               # UI & Game Components
│   │   ├── game/                 # 2D Simulation Engine Components
│   │   │   ├── cyber/            # Phaser SOC scene, Threat Panel, Timeline, Controls
│   │   │   └── dataCenter/       # Phaser Server Room scene, Station Mapping, UI
│   │   ├── hr/                   # HR Enterprise Portal Components
│   │   ├── talent/               # Talent Dashboard & Profile Components
│   │   └── ui/                   # Shared Reusable UI Components
│   ├── dashboard/                # Main Dashboard Layouts & Views
│   │   ├── hr/                   # HR Dashboard (Inbox, Job Manager, Talent Pool)
│   │   └── talent/               # Talent Dashboard (Simulation Hub, Network Hub)
│   ├── services/                 # Business Logic Services (Scenario, Decision, Profile)
│   ├── store/                    # Zustand Reactive Stores (gameStore, cyberFxStore)
│   ├── types/                    # TypeScript interfaces & type definitions
│   ├── globals.css               # Global styling & Tailwind CSS v4 design tokens
│   └── page.tsx                  # Landing Page
├── scripts/
│   └── validate-decision-tree.mjs# CLI utility validating decision tree DAG graph integrity
├── supabase/
│   ├── enable_public_read_rls.sql# Public read-only RLS policy configuration
│   ├── seed_cybersecurity_analyst.sql   # Cybersecurity Analyst scenario seed data
│   └── seed_data_center_technician.sql  # Data Center Technician scenario seed data
└── utils/
    └── supabase/                 # Supabase client helpers (Browser & Server SSR)
```

---

## 🗄️ 5. Database Architecture & Entity Relationship Diagram (ERD)

The Supabase PostgreSQL database separates data into two primary domain domains: **Master Reference Data** (game decision trees) and **User & Operational Data** (profiles, scores, job listings, messages).

```mermaid
erDiagram
    mst_title ||--o{ mst_skenario : "owns"
    mst_skenario ||--o{ mst_problem_statement : "has root node"
    mst_problem_statement ||--o{ mst_decision : "has decision branches"
    
    profiles ||--o| talent_profiles : "talent details"
    profiles ||--o{ jobs : "created by HR"
    profiles ||--o{ inbox_messages : "sender/receiver"
    profiles ||--o{ network_connections : "connected with"
    
    talent_profiles ||--o{ talent_skills : "possesses skills"
    talent_profiles ||--o{ simulation_attempts : "completes"
    
    jobs ||--o{ applications : "receives"

    mst_title {
        uuid id PK
        string name
    }

    mst_skenario {
        uuid id PK
        uuid id_title FK
        string skenario
        string tingkat_kesulitan
        int estimasi_durasi
        uuid start_problem_statement_id FK
    }

    mst_problem_statement {
        uuid id PK
        text briefing_awal
    }

    mst_decision {
        uuid id PK
        uuid problem_statement_id FK
        string title
        text text
        text konsekuensi
        string status
        int skor
        uuid next_problem_statement_id FK
    }

    profiles {
        uuid id PK
        string role "talent | hr"
        string full_name
        string email
        string company_name
        string location
        timestamp created_at
    }

    simulation_attempts {
        uuid id PK
        uuid user_id FK
        uuid scenario_id FK
        int final_score
        string status "completed | failed"
        timestamp completed_at
    }
```

---

## 🎮 6. Game & Decision Engine Workflow (DAG Graph)

The simulation engine models decision-making as a **Directed Acyclic Graph (DAG)** where each player choice affects scores (rewards or penalties) and determines branching to subsequent nodes.

```mermaid
flowchart TD
    Start([🕹️ Player Starts Simulation]) --> FetchMaster[Fetch Master Scenario & Root Node from Supabase]
    FetchMaster --> InitPhaser[Initialize Phaser Canvas Scene & Zustand State]
    InitPhaser --> RenderNode[Render Briefing & Decision Options on UI Panel]
    
    RenderNode --> PlayerChoice{Player Selects Decision Option}
    
    PlayerChoice -->|Correct Choice / Success| AddScore[Add Score + Update HUD Status]
    PlayerChoice -->|Risky Choice / Warning| MildPenalty[Deduct Minor Penalty + Warning Toast]
    PlayerChoice -->|Fatal Choice / Critical| HeavyPenalty[Deduct Major Penalty + Critical Consequence]
    
    AddScore --> NextCheck{Is Next Node Present?}
    MildPenalty --> NextCheck
    HeavyPenalty --> NextCheck

    NextCheck -->|Yes: next_problem_statement_id != null| FetchNextNode[Load New Node & Trigger Phaser Anomaly Visuals]
    FetchNextNode --> RenderNode

    NextCheck -->|No: Terminal Node| FinishGame[Calculate Final Score & Micro-Credential Certificate]
    FinishGame --> SaveScore[Persist Result to Supabase DB via /api/score]
    SaveScore --> End([🏆 Display Evaluation Breakdown])
```

### DAG Graph Validation (`scripts/validate-decision-tree.mjs`)
To guarantee production integrity, an automated graph validation tool runs key checks:
- **BFS (Breadth-First Search)**: Verifies that no dead ends exist (nodes without choices) and detects invalid UUID pointers.
- **DFS (Depth-First Search)**: Detects circular dependencies (infinite loops) in decision trees.
- **Orphan Node Detection**: Identifies unlinked database rows unreachable from the scenario entry point.

---

## 🤖 7. AI Resume Parser Pipeline Architecture

CV processing is automated via a deep-learning OCR microservice pipeline to generate verified talent skill profiles.

```mermaid
sequenceDiagram
    autonumber
    actor Talent as Talent (User)
    participant UI as Dashboard Client
    participant Storage as Supabase Storage
    participant API as Next.js API (/api/cv)
    participant AI as Python Flask AI Microservice
    participant DB as Supabase PostgreSQL

    Talent->>UI: Upload Resume File (.pdf)
    UI->>Storage: Upload PDF File to Bucket 'cv_documents'
    Storage-->>UI: Return Public PDF URL
    UI->>API: POST /api/upload-cv (File URL)
    API->>AI: Forward Request & File Stream to Flask Service
    AI->>AI: RapidOCR Text Detection & Recognition (ONNX)
    AI->>AI: Skill Mapping & Entity Extraction Parser
    AI-->>API: Return Structured JSON (Name, Email, Skill List, Experience)
    API->>DB: Upsert Data into 'talent_profiles' & 'talent_skills'
    DB-->>API: Confirm Update Success
    API-->>UI: Response 200 OK + Extracted Profile Payload
    UI-->>Talent: Display Profile UI & Match Score
```

---

## 🔒 8. Security Architecture & Access Control

1. **Supabase Row Level Security (RLS)**:
   - Reference master tables (`mst_*`) are restricted to `PUBLIC READ` (`SELECT` policy granted to anon/auth users).
   - User tables (`profiles`, `inbox_messages`, `simulation_attempts`) are protected via `auth.uid()` RLS rules, restricting data access strictly to authenticated record owners.
2. **Role-Based Access Control (RBAC)**:
   - `talent` Role: Grants access to interactive simulations, CV parsing, and networking features.
   - `hr` Role: Grants access to the HR Enterprise Portal, job listing creation, talent pool filtering, and direct outreach.
3. **Secrets Protection**:
   - Environment secrets (`SMTP_PASS`, `SUPABASE_SERVICE_ROLE_KEY`) are kept isolated on serverless Next.js API routes and never bundled into client-side JavaScript.

---

## 🚀 9. Deployment & Infrastructure Strategy

- **Frontend & Serverless BFF**: Deployed to **Vercel / Cloud Edge Network** with automated CI/CD integration.
- **Database & Storage**: Hosted on **Supabase Cloud Infrastructure** (Managed PostgreSQL + Supabase Auth + Supabase Storage).
- **AI Microservice**: Containerized Python Flask Application (Docker) deployed on cloud container platforms (AWS ECS / Google Cloud Run / Render) with ONNX Runtime acceleration.

---

*This document serves as the official system architecture specification for the Talent Bridge Platform.*