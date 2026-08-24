<div align="center">

  <br />
  
  <img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=800&size=32&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&width=800&height=65&lines=Dip-Desk;Diploma+Student+Resource+Platform;Notes+%E2%80%A2+Books+%E2%80%A2+Papers+%E2%80%A2+Lab+Manuals;Built+with+Next.js+16+%26+TypeScript" alt="Dip-Desk Typing Header" />

  <p align="center">
    <b>The Ultimate All-in-One Resource Platform Designed for Polytechnic &amp; Diploma Students</b>
  </p>

  <p align="center">
    <a href="https://dip-desk.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Live_App-dip--desk.vercel.app-0070F3?style=for-the-badge&logo=vercel&logoColor=white&labelColor=000000" alt="Live App" />
    </a>
    <a href="https://github.com/0-ZERONE-1/Dip-Desk">
      <img src="https://img.shields.io/badge/GitHub-0--ZERONE--1%2FDip--Desk-2DBA4E?style=for-the-badge&logo=github&logoColor=white&labelColor=181717" alt="GitHub Repository" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Version-v1.0.4-6366F1?style=for-the-badge&logoColor=white&labelColor=0F172A" alt="Version v1.0.4" />
    <img src="https://img.shields.io/badge/Next.js-v16.3-9333EA?style=for-the-badge&logo=next.js&logoColor=white&labelColor=0F172A" alt="Next.js v16.3" />
    <img src="https://img.shields.io/badge/TypeScript-v5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=1E293B" alt="TypeScript v5.0" />
    <img src="https://img.shields.io/badge/MongoDB-v8.5-47A248?style=for-the-badge&logo=mongodb&logoColor=white&labelColor=0F172A" alt="MongoDB v8.5" />
  </p>

  <br />

</div>

---

## <img src="https://api.iconify.design/lucide:layout-grid.svg?color=%236366f1" width="22" height="22" valign="middle" /> Overview

**Dip-Desk** is a high-performance, full-stack web application engineered specifically for **Polytechnic & Diploma Engineering students**. It provides structured, instant access to syllabus-aligned **Lecture Notes**, **Reference Textbooks**, **Model Question Papers**, and **Practical Lab Manuals** — grouped by branch, semester, and subject.

Designed with a focus on modern aesthetic excellence, dynamic scroll animations, and bulletproof security, Dip-Desk bridges the gap between students looking for study materials and administrators curating academic content.

---

## <img src="https://api.iconify.design/lucide:check-circle-2.svg?color=%236366f1" width="22" height="22" valign="middle" /> Key Features

### <img src="https://api.iconify.design/lucide:graduation-cap.svg?color=%236366f1" width="19" height="19" valign="middle" /> **Student Experience**
- **Instant Global Search**: Sub-second real-time search with dynamic dropdown suggestions across all departments, semesters, and subjects (powered by Fuse.js).
- **Instant Online Document Viewer**: Preview PDFs and study guides directly in-browser — no downloads, no storage required.
- **First-Load Header Entrance Animations**: Sequenced directional entrance animations for navbar islands (Left Logo, Center Nav, Right Profile) timed to play right after hero text entrance on initial load or refresh, skipped on SPA tab changes.
- **Scroll-Triggered Animations**: Hero stats, feature cards, and notice sections animate into view dynamically as you scroll down.
- **Community Quality Voting**: Upvote or downvote study materials to surface the best resources with real-time state sync across tabs.
- **Personal Student Panel** (fixed viewport sidebar):
  - **Locked Sidebar**: Fixed desktop control panel aligned with page margin that stays locked in place while content scrolls.
  - **Unified Mobile Switcher**: 2-column grid dropdown trigger for easy 1-tap module switching on mobile devices.
  - **Editable Profile**: Full Name, Title/Designation, Institute Name, Registration Number, Profile Photo.
  - **Saved Resources Library**: 1-click bookmark access for exam season.
  - **Liked / Disliked Resource Tracking**: Keep tabs on materials you rated.
  - **Resource Request Pipeline**: Submit requests for missing notes and track fulfillment (`Pending` / `Fulfilled`).
  - **Rose-Accented Sign Out Button**: Prominent full-width sign-out button inside the user controls card.

### <img src="https://api.iconify.design/lucide:shield-check.svg?color=%239333ea" width="19" height="19" valign="middle" /> **Admin Management Panel**
- **Direct Admin Access**: Clicking the account avatar circle routes directly to `/admin` — no dropdown menus.
- **Locked Desktop Sidebar**: Fixed viewport positioning locked to the screen, keeping all admin modules accessible during long page scrolls.
- **Matching Mobile Switcher**: 2-column grid dropdown overlay identical to the Student Dashboard for effortless mobile admin navigation.
- **Department & Subject Hierarchy**: Create, edit, and organize academic departments, semester curricula, and subject cards.
- **Resource Management**: Upload, edit, verify, or toggle resource availability — URL validated on input.
- **Notice Board Manager**: Broadcast pinned diploma announcements with live badge alerts.
- **Request Approval Pipeline**: Review and fulfill student study material requests.
- **User Management**: View all registered students with instant status filter & search, ban/unban accounts.
- **Developer Team Profiles**: Manage the Developers page team member cards.
- **Site-Wide Custom Branding**: Paste any public SVG or image URL to replace the header logo across the entire platform. Falls back to a simple book icon when no URL is set.
- **Link Health Check**: Run a server-side scan to detect broken external resource links in the database.

### <img src="https://api.iconify.design/lucide:lock.svg?color=%233b82f6" width="19" height="19" valign="middle" /> **Security**
- bcrypt password hashing (cost factor 12)
- Rate limiting on registration (5/IP/15min) and login (10/email/15min)
- NoSQL injection protection via `sanitizeString()` on all user inputs
- URL SSRF protection via `validateUrl()` with private IP blocklist (`10.x`, `192.168.x`, `169.254.x`, `::1`, etc.)
- Health-check SSRF guard — validates all stored URLs before server-side fetch
- Input sanitization on all admin resource creation inputs
- Content Security Policy (CSP), HSTS, X-Frame-Options, X-Content-Type-Options headers
- Admin role enforced server-side on every write endpoint (`requireAdmin()`)
- Middleware edge guards on `/admin/*` and `/dashboard/*`

---

## <img src="https://api.iconify.design/lucide:layers.svg?color=%236366f1" width="22" height="22" valign="middle" /> Software & Technologies Used

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| <img src="https://api.iconify.design/logos:nextjs-icon.svg" width="18" height="18" valign="middle" /> **Next.js** | **v16.3.0** | Full-stack React Framework (App Router & Turbopack) |
| <img src="https://api.iconify.design/logos:typescript-icon.svg" width="18" height="18" valign="middle" /> **TypeScript** | **v5.0.0** | Strongly-typed language for robust, safe code |
| <img src="https://api.iconify.design/logos:tailwindcss-icon.svg" width="18" height="18" valign="middle" /> **Tailwind CSS / Vanilla CSS** | **v3.4.1** | Utility-first & custom HSL CSS engine for responsive UI |
| <img src="https://api.iconify.design/lucide:shield-check.svg?color=%236366f1" width="18" height="18" valign="middle" /> **NextAuth.js** | **v4.24.7** | Authentication engine for Student & Admin session login |
| <img src="https://api.iconify.design/logos:framer.svg" width="18" height="18" valign="middle" /> **Framer Motion** | **v11.3.8** | Fluid layout animations & interactive micro-transitions |
| <img src="https://api.iconify.design/logos:mongodb-icon.svg" width="18" height="18" valign="middle" /> **MongoDB / Mongoose** | **v8.5.1** | NoSQL cloud database with localStorage fallback |
| <img src="https://api.iconify.design/lucide:search.svg?color=%233b82f6" width="18" height="18" valign="middle" /> **Fuse.js** | **v7.0.0** | Lightweight client-side fuzzy search indexing |
| <img src="https://api.iconify.design/lucide:sparkles.svg?color=%23a855f7" width="18" height="18" valign="middle" /> **Lucide React** | **v0.417.0** | Modern crisp SVG icons set for accessible UI elements |
| <img src="https://api.iconify.design/lucide:bell.svg?color=%23f59e0b" width="18" height="18" valign="middle" /> **React Hot Toast** | **v2.4.1** | Dynamic alert toast notifications |

---

## <img src="https://api.iconify.design/lucide:key-round.svg?color=%236366f1" width="22" height="22" valign="middle" /> Access Credentials

| Role | Access URL | Email | Password |
| :--- | :--- | :--- | :--- |
| **Student** | `/login` → **Register / Sign In** | *Create any email & password* | *Min 8 characters* |
| **Admin** | `/login` → **Sign In** | Set via `ADMIN_EMAIL` env var | Set via `ADMIN_PASSWORD` env var |

> <img src="https://api.iconify.design/lucide:alert-triangle.svg?color=%23f59e0b" width="16" height="16" valign="middle" /> Admin credentials are loaded exclusively from environment variables. Never hardcoded.

---

## <img src="https://api.iconify.design/lucide:cpu.svg?color=%236366f1" width="22" height="22" valign="middle" /> System Architecture

```mermaid
graph TD
    A[Client Browser] -->|NextAuth JWT Sessions| B[Next.js 16 App Router]
    B -->|UI & Scroll Animations| C[TailwindCSS + Framer Motion + Lucide]
    B -->|Auth & Rate Limiting| D[NextAuth + bcrypt + In-Memory Rate Limiter]
    B -->|Data & Persistence| E[MongoDB Atlas / localStorage Fallback Store]
    B -->|Security Layer| F[CSP Headers + SSRF Guards + Input Sanitization]
    B -->|Deployment| G[Vercel Serverless Platform]
```

---

## <img src="https://api.iconify.design/lucide:rocket.svg?color=%236366f1" width="22" height="22" valign="middle" /> Getting Started

### 1. Prerequisites
- Node.js **18.x** or higher
- npm or yarn

### 2. Clone the Repository
```bash
git clone https://github.com/0-ZERONE-1/Dip-Desk.git
cd Dip-Desk
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the example file and fill in your own values:
```bash
cp .env.example .env.local
```
Then edit `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-own-random-secret

# Optional: MongoDB Atlas connection (app works without it using local fallback)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dipdesk

# Set your own admin credentials — you choose these yourself
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-strong-password
```

> <img src="https://api.iconify.design/lucide:info.svg?color=%233b82f6" width="16" height="16" valign="middle" /> **Note for cloners:** These credentials are for YOUR local instance only. They have nothing to do with the live deployed site. The live site uses its own separate environment variables set on Vercel.


### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## <img src="https://api.iconify.design/lucide:folder-tree.svg?color=%236366f1" width="22" height="22" valign="middle" /> Project Structure

```
Dip-Desk/
├── app/                        # Next.js 16 App Router pages & API routes
│   ├── page.tsx                # Home page (hero, stats, features, notices)
│   ├── about/                  # About page (tech stack, features, user guide)
│   ├── browse/                 # Browse departments, semesters, subjects
│   ├── notices/                # Live notice board
│   ├── developers/             # Developer team profiles
│   ├── admin/                  # Admin Panel (Dashboard, Notices, Resources, Users, Cheat, Health)
│   ├── dashboard/              # Student Panel (Profile, Saved, Liked, Requests)
│   ├── login/                  # Login & Registration page
│   └── api/                    # REST API endpoints
│       ├── auth/               # NextAuth & Registration
│       ├── resources/          # Resources CRUD
│       ├── notices/            # Notices CRUD
│       ├── departments/        # Departments CRUD
│       ├── subjects/           # Subjects CRUD
│       ├── developers/         # Developer profiles CRUD
│       ├── requests/           # Student resource requests
│       ├── stats/              # Platform stats & custom logo URL
│       ├── image-proxy/        # SSRF-guarded image proxy
│       ├── user/profile/       # Student profile GET & POST
│       └── admin/              # Admin-only: users, requests, health-check
├── components/                 # Reusable UI components
│   ├── admin/                  # AdminNav, AdminPageWrapper, ConfirmDeleteModal
│   ├── home/                   # Hero, FeaturesSection, LatestNoticeSection, StatsSection
│   └── layout/                 # Navbar, DipDeskLogo, MobileMenu, Search bar
├── lib/                        # Core backend utilities & models
│   ├── auth.ts                 # NextAuth authentication config
│   ├── store.ts                # Global in-memory store & persistence
│   ├── sanitize.ts             # Input sanitization & URL validation
│   ├── rateLimit.ts            # Per-IP & per-email rate limiter
│   ├── requireAdmin.ts         # Server-side admin session guard
│   ├── utils.ts                # Helpers including getRawImageUrl for GitHub URLs
│   └── models/                 # Mongoose schemas (User, Admin, Resource, Notice, etc.)
├── public/                     # Static assets & favicon
├── middleware.ts               # Edge middleware for route protection & ban enforcement
└── README.md                   # Project Documentation
```

---

## <img src="https://api.iconify.design/lucide:code-2.svg?color=%236366f1" width="22" height="22" valign="middle" /> Author & Acknowledgements

Created with <img src="https://api.iconify.design/lucide:heart.svg?color=%23ef4444" width="16" height="16" valign="middle" /> by **ZERONE** for diploma students worldwide.

- **GitHub**: [@0-ZERONE-1](https://github.com/0-ZERONE-1)
- **Project Repository**: [Dip-Desk](https://github.com/0-ZERONE-1/Dip-Desk)
- **Live Web App**: [dip-desk.vercel.app](https://dip-desk.vercel.app)

---

<div align="center">
  <sub>Built for students, with students in mind. Star this repo if you find it helpful!</sub>
</div>
