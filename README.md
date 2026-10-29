# AIESEC iCX ERP

> Enterprise Resource Planning & Operations Management System for **AIESEC in Rabat & Morocco** (AEPP, APIP, and AFPM Compliant).

---

## 🌟 Overview

**AIESEC iCX ERP** is a dedicated Next.js operational platform built for incoming exchange operations (iGV, iGTa, iGTe). It centralizes exchange participant dossiers, legal/visa clearances, partner relationship pipelines, financial tracking, and governance compliance audits into a unified, high-reliability workspace.

---

## 🚀 Key Features

- **4-Group Global Navigation**:
  - **Command**: Executive command dashboard, active exchange pipelines, and unified status overview.
  - **External Engine (BD)**: Lead CRM, partner pipelines, sales intelligence, and opportunity publishing.
  - **Internal Engine (Ops / CXP)**: EP Dossier trackers, visa/legal clearances, pick-ups, accommodation, and standard delivery audits.
  - **Finance & People (FnL / TM)**: Financial auditing, cash-in/out records, team allocation, and ECB/ICB governance rules.
- **⚡ Rapid Intake (`+ Quick Add` & `⌘K`)**:
  - One-click modal launcher for fast intake across 8 critical stakeholder flows (EP, Lead, Partner, Expense, Inflow, Matching, Pick-up, Dispute).
- **⚙️ Integrated Data & Settings**:
  - Complete JSON backup export and import/restore.
  - Active view CSV data export.
  - Multi-step seed state reset.
- **🛡️ Governance & Quality Gate Engine**:
  - Automated evaluation of AEPP, APIP, and AFPM compliance requirements.
  - Mandatory legal, financial, and exchange standard verification before status transitions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **State & Data**: [Zod](https://zod.dev/), [Supabase SSR & JS Client](https://supabase.com/)
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/)

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/wadiihani/iCX-ERP.git
cd iCX-ERP

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### Building & Testing
```bash
# Production build
npm run build

# Run unit and integration tests
npm test
```

---

## 👤 Author & Maintainer

- **Wadii Hani** — [wadii.hani.pro@gmail.com](mailto:wadii.hani.pro@gmail.com)
- GitHub: [@wadiihani](https://github.com/wadiihani)
