# Notify

Notify is a comprehensive, centralized personal dashboard built to replace scattered productivity apps. It combines daily task management, real-time project time tracking, and personal finance ledgers into a single, secure, and modern web application.

## Features

The application is divided into three core pillars, all aggregated into a high-level Command Center dashboard.

### 1. Personal HUD
* **Task Management:** A daily to-do list with due dates and instant completion toggles.
* **Habit Tracker:** Establish daily habits and track your completion rate to build visual streaks.
* **Quick Notes:** A markdown-ready scratchpad for journaling and rapid thought capture.

### 2. Work Tracker
* **Project Manager:** Track active projects and upcoming deadlines.
* **Live Project Timer:** A real-time browser-based timer that directly logs focused work sessions to the database, linked to specific projects.
* **Time Logs:** A historical view of all recorded work sessions and their durations.

### 3. Financial Ledger
* **Cash Flow Tracking:** Log granular income and expense transactions to calculate dynamic net balances.
* **Subscription Manager:** Track recurring bills, calculate true monthly run-rates, and get visual warnings for payments due within 7 days.
* **Savings Goals:** Set specific financial targets, log contributions, and track progress via visual indicators.

## Tech Stack

* **Frontend Framework:** [React 18](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Routing:** [React Router v6](https://reactrouter.com/)
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Authentication:** Supabase Auth (Email/Password)
* **Styling:** Custom CSS (Dark Mode optimized)

## Prerequisites

Before running this project, you must have:
* [Node.js](https://nodejs.org/) installed on your machine.
* A free account and project created on [Supabase](https://supabase.com/).

## Local Setup & Installation

**1. Clone the repository and install dependencies:**
```bash
git clone [https://github.com/yourusername/notify.git](https://github.com/yourusername/notify.git)
cd notify
npm install
```