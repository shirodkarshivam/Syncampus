# SyncCampus: Intelligent College Operations & Conflict-Free Campus Management Platform

SyncCampus is an enterprise-grade, high-performance web application designed for higher education institutions. It provides a real-time, conflict-free academic scheduling and operations engine connecting **Students**, **Faculty**, and **Campus Administration** under a unified, reactive architecture.

---

## 📋 Table of Contents
1. [Executive Summary & Core Metrics](#-executive-summary--core-metrics)
2. [Technology Stack & Architectural Principles](#-technology-stack--architectural-principles)
3. [Master Datasets & College Scale](#-master-datasets--college-scale)
4. [What Has Been Implemented (Detailed Feature Breakdown)](#-what-has-been-implemented-detailed-feature-breakdown)
   - [Unified Authentication & Dynamic Search Login](#1-unified-authentication--dynamic-search-login)
   - [Student Portal & Experience](#2-student-portal--experience)
   - [Faculty Portal & Schedule Management](#3-faculty-portal--schedule-management)
   - [Admin Control Center](#4-admin-control-center)
   - [Conflict Management & Prevention Engine](#5-conflict-management--prevention-engine)
   - [Notification Drawer & Broadcast System](#6-notification-drawer--broadcast-system)
   - [User Profile, Avatar & Security Management](#7-user-profile-avatar--security-management)
   - [Mobile Viewport Optimization (< 768px)](#8-mobile-viewport-optimization--768px)
5. [What Has NOT Been Implemented (Current Gaps & Production Roadmap)](#-what-has-not-been-implemented-current-gaps--production-roadmap)
6. [Complete Workspace Directory & File Map](#-complete-workspace-directory--file-map)
7. [Installation, Development & Build Guide](#-installation-development--build-guide)

---

## 🏫 Executive Summary & Core Metrics

SyncCampus was engineered around the operational blueprint of a standard comprehensive degree college (**Sonopant College of Arts, Commerce & Science**). The system eliminates timetable clashes, double-booked classrooms, and faculty scheduling overlaps across the entire academic institution.

### Real-World College Operational Metrics:
* **Academic Departments**: `4` (Science & Technology, Commerce & Accountancy, Arts & Humanities, Management Studies)
* **Degree Programs / Courses**: `8` (BSc IT, BSc CS, BCA, BCom, BAF, BBA, BA English, BA Psychology)
* **Student Cohort Divisions**: `51` Active Class Divisions across FY (First Year), SY (Second Year), and TY (Third Year)
* **Enrolled Student Population**: `2,700` fully indexed students with unique IDs, emails, divisions, and practical batches
* **Academic Faculty Roster**: `72` designated professors and lecturers with specialized subject allocations
* **Physical Infrastructure**: `62` Campus Spaces (54 Classrooms, 6 Computer Labs, 2 Seminar Halls / Auditoriums)
* **Academic Schedule Slots**: 5 Teaching Days (Monday–Friday), 5 Periods per Day (`09:00 - 10:00`, `10:00 - 11:00`, `11:00 - 12:00`, `01:00 - 02:00`, `02:00 - 03:00`)
* **Weekly Synchronized Sessions**: `1,275` conflict-free master timetable lecture allocations

---

## 🛠 Technology Stack & Architectural Principles

| Layer | Technology | Description |
|---|---|---|
| **Core Framework** | React 19 (`react`, `react-dom`) | Modern component-based frontend framework |
| **Language & Typings** | TypeScript 5.9 (`strict: true`) | Strict type validation across all entities, state, and props |
| **Build & Bundling** | Vite 8 + Rolldown (`@vitejs/plugin-react`) | Lightning-fast HMR and optimized production bundle compilation |
| **Styling & Design System** | Vanilla CSS (`CSS Variables`, Glassmorphism, HSL) | Custom modern design system; no Tailwind bloat; bespoke responsive layouts |
| **Icons & Visual Language** | Lucide React (`lucide-react`) | Consistent iconography across dashboards, navigation, badges, and alerts |
| **State & Persistence** | In-Memory Cache + `localStorage` + Event Bus | Real-time cross-tab and cross-role state sync via custom browser dispatchers |

### Key Architectural Decisions:
1. **Zero External Backend Server Requirement**: The platform runs entirely in-browser using a reactive storage event bus (`timetableStore` and `userProfileStore`), allowing full demonstration of real-time scheduling without configuring databases or servers.
2. **Conflict-Free Single Source of Truth**: The master timetable is initialized once and stored under versioned keys (`syncampus_master_timetable_v3`), preventing divergence between what an admin sets, what a teacher sees, and what a student accesses.
3. **Decoupled Role Portals**: Independent UI layouts for Students, Teachers, and Admins while sharing core components (`NotificationDrawer`, modals, and type definitions).

---

## 📊 Master Datasets & College Scale

SyncCampus is populated with structured data sourced from `college.txt` and `Student_data.txt`:

```
               [ 4 DEPARTMENTS ]
                       │
         ┌─────────────┴─────────────┐
 [ 8 Degree Courses ]         [ 72 Verified Faculty ]
         │                                   │
 [ 51 Class Divisions ]               [ 62 Campus Spaces ]
         │                                   │
 [ 2,700 Enrolled Students ]                 │
         │                                   │
         └─────────────┬─────────────────────┘
                       ▼
       [ 1,275 Conflict-Free Lectures ]
```

### 1. Departments & Courses
* **Department of Science & Technology**:
  * `BSc IT` (Information Technology): FY (Div A, B), SY (Div A, B), TY (Div A, B)
  * `BSc CS` (Computer Science): FY (Div A, B), SY (Div A, B), TY (Div A, B)
  * `BCA` (Computer Applications): FY (Div A, B), SY (Div A, B), TY (Div A, B)
* **Department of Commerce & Accountancy**:
  * `BCom` (General Commerce): FY (Div A, B, C, D), SY (Div A, B, C, D), TY (Div A, B, C, D)
  * `BAF` (Accounting & Finance): FY (Div A, B), SY (Div A, B), TY (Div A, B)
* **Department of Management Studies**:
  * `BBA` (Business Administration): FY (Div A, B), SY (Div A, B), TY (Div A, B)
* **Department of Arts & Humanities**:
  * `BA English`: FY (Div A, B), SY (Div A, B), TY (Div A, B)
  * `BA Psychology`: FY (Div A, B), SY (Div A, B), TY (Div A, B)

### 2. Physical Infrastructure (62 Spaces)
* **General Classrooms (54)**: `Room 101` through `Room 112`, `Room 201` through `Room 214`, `Room 301` through `Room 314`, `Room 401` through `Room 414` (Capacity: 50–70 students).
* **Computer Laboratories (6)**: `Lab 1 (CS Lab 1)`, `Lab 2 (CS Lab 2)`, `Lab 3 (IT Lab 1)`, `Lab 4 (IT Lab 2)`, `Lab 5 (Data Analytics Lab)`, `Lab 6 (Hardware & Network Lab)` (Capacity: 35–45 workstations).
* **Seminar Halls & Auditoriums (2)**: `Seminar Hall 1` (Cap: 150), `Auditorium 1` (Cap: 250).

---

## 🚀 What Has Been Implemented (Detailed Feature Breakdown)

### 1. Unified Authentication & Dynamic Search Login
* **Multi-Role Selector**: Instant toggle between Student, Teacher, and Admin portal logins.
* **Universal Search & Autocomplete**:
  * Matches any student by full name, college email (`stuXXXX@sonopantcollege.edu.in`), or Roll Number/Student ID (`STU0001` - `STU2700`).
  * Matches any faculty member by name (e.g., `Prof. Rahul Patil`, `Neha Kulkarni`), faculty ID (`T001` - `T072`), or institutional email.
* **Interactive Directory Modals**:
  * **Faculty Directory Modal**: Search all 72 teachers with department filtering (`Science & Tech`, `Commerce`, `Management`, `Arts`) and 1-click credential auto-fill.
  * **Student Directory Modal**: Search all 2,700 students with department filter and 1-click credential auto-fill.
* **Simulated 6-Digit OTP Verification**: Clean numeric auto-advancing input fields with resend countdown timer.

### 2. Student Portal & Experience
* **Auto-Resolved Profile**: Automatically loads the student's enrolled course, academic year, division, assigned base classroom, and practical batch.
* **Smart Academic Day Schedule**:
  * Displays today's lectures in chronological order.
  * **Weekend Intelligence**: On Saturday or Sunday, the dashboard automatically shifts to show Monday's upcoming academic schedule.
* **Timetable Views**:
  * **Weekly 5×5 Master Grid**: Complete view of Monday–Friday across all 5 periods.
  * **Daily Schedule List View**: Clean, stacked timeline with subject badge, room number, faculty name, and period duration.
* **Profile View**:
  * Enrolled course details and list of registered curriculum subjects with their specific assigned professors.
  * Editable student contact number and guardian/parent emergency contact with validation.
  * Profile picture upload with real-time base64 image preview and removal option.
  * Login password change form with current password verification and minimum 6-character validation.
* **Cleaned-Up Interface**: Removed clutter (announcement cards, exams section, reports) to provide a distraction-free student workflow.

### 3. Faculty Portal & Schedule Management
* **Personalized Teaching Agenda**:
  * Shows only lectures assigned to the logged-in professor across their various course divisions.
  * Highlights current session status and total weekly lecture workload (e.g., 18 weekly teaching sessions).
* **"My Classes" Roster**:
  * Lists every division taught by the faculty member.
  * View enrolled student count and breakdown by course and division.
* **Schedule Actions on Teaching Sessions**:
  1. **Cancel Lecture**:
     * Modal to select cancellation reason (e.g., *Medical Leave*, *Academic Conference*, *Emergency*).
     * Frees up the classroom and faculty slot in real time.
     * Broadcasts an instant cancellation alert to all affected students.
  2. **Reschedule Lecture**:
     * Allows moving a session to another period on that day.
     * Enforces real-time multi-dimensional conflict detection (checks room, teacher, and cohort availability).
  3. **Change Classroom**:
     * Relocates a session to another campus room with strict vacancy checking.
* **Faculty Profile & Preferences**:
  * Cabin room, employee ID, department, and specialized subjects.
  * Editable mobile contact number, emergency contact, custom photo upload, and password update.

### 4. Admin Control Center
* **Live Campus Overview**:
  * Active sessions counter, scheduled vs rescheduled vs cancelled lecture metrics.
  * Real-time activity log documenting every reschedule, cancellation, and room shift.
* **Campus-Wide Master Timetable**:
  * Filter across all 51 divisions, 8 courses, 4 departments, and 5 weekdays.
  * Admin-level override to reschedule lectures or assign substitute teachers.
* **Classroom Occupancy Monitor**:
  * Status grid of all 62 classrooms and labs showing current vacancy or occupying lecture.
* **Faculty & Student Registries**:
  * Search, view, and add new faculty members or students.
* **Curriculum & Division Views**:
  * Review all course structures, semester subject distributions, and division allocations.

### 5. Conflict Management & Prevention Engine
The core intelligence layer residing in `client/src/data/timetableStore.ts` protects the integrity of the college schedule:
* **3-Dimensional Conflict Algorithm**:
  1. **Room Conflict**: Verifies whether the target classroom or lab is already hosting an active (non-cancelled) session at that exact day and time.
  2. **Faculty Conflict**: Prevents double-booking a professor across two different rooms or divisions at the same time.
  3. **Division / Student Conflict**: Prevents a student cohort from being assigned two simultaneous lectures.
* **Proactive UI Enforcement**:
  * **Classroom Reallocation Modal (`TeacherChangeRoomModal.tsx`)**:
    * Automatically computes room occupancy for that period.
    * Features a toggle: *"Showing Free Only"* (default) vs *"All Rooms"*.
    * If an occupied room (e.g. `Room 103`) is picked, displays a prominent **red conflict banner** showing who is occupying it (Faculty Name, Subject, Division) and **disables the Submit button**.
    * Provides **1-click clickable chips** of verified vacant rooms for instant correction.
  * **Reschedule Modals**:
    * Blocks rescheduling to any slot where the faculty member, room, or student division has an overlapping lecture.
  * **Store-Level Rejection**: Even if a direct call attempts an invalid change, `timetableStore.changeRoom()` and `timetableStore.rescheduleLecture()` reject the modification, set an error message, and return `null`.

### 6. Notification Drawer & Broadcast System
* **Topbar Bell Icon with Unread Badge**:
  * Available in both Student and Faculty navigation bars with a real-time red notification counter.
* **Slide-Out Notification Drawer (`NotificationDrawer.tsx`)**:
  * **Active Tab**: Displays unread schedule change alerts (`Cancelled`, `Rescheduled`, `Room Changed`, `Faculty Reassigned`) with color-coded badges, relative timestamps, and one-click "Dismiss" action.
  * **History / Past Alerts Tab**: Allows reviewing previously dismissed schedule notices with their original timestamps.
  * **Restore Action**: Allows bringing a dismissed alert back to the active list.
  * **Mark All as Read**: Clears the active badge in one click.

### 7. User Profile, Avatar & Security Management
* **Dedicated Data Layer (`userProfileStore.ts`)**:
  * Persists user-customized profile settings in `localStorage` under `syncampus_user_profile_<email/id>`.
* **Profile Customization Features**:
  * **Avatar Upload**: Select any image file (`< 2MB`); automatically encoded to Base64 via `FileReader`.
  * **Live Avatar Sync**: Custom avatar immediately reflects in the top navigation pill and profile header across views.
  * **Contact & Emergency Contact**: Form fields with instant feedback badges upon saving.
  * **Change Login Password**: Validates current password (default: `password123`), ensures new password is ≥ 6 characters, checks confirmation match, and updates securely.

### 8. Mobile Viewport Optimization (< 768px)
* **Adaptive Timetable View**:
  * On mobile screens and narrow viewports (`< 768px`), both Student and Faculty timetables default directly to the **Daily Schedule List** view rather than forcing users to horizontal-scroll through a dense 5×5 table.
  * Day pill selectors (Monday–Friday) allow smooth, thumb-friendly navigation.
  * Auto-selects today's weekday for immediate schedule access.
* **Mobile Drawer & Bottom Navigation**:
  * Slide-out hamburger menu on mobile topbars.
  * Quick-access bottom navigation bar for high-frequency actions.

---

## ⚠️ What Has NOT Been Implemented (Current Gaps & Production Roadmap)

To maintain transparent software engineering documentation, the following capabilities represent future production scope and have not yet been built:

### 1. Backend Server & Permanent Database Persistence
* **Current State**: Operates as a purely client-side Single Page Application (SPA). All state modifications (room changes, lecture cancellations, password updates, custom avatars) persist in the browser's `localStorage` and synchronize across components/tabs using custom DOM events.
* **Future Implementation**:
  * Node.js/Express or Python/FastAPI REST/GraphQL backend.
  * PostgreSQL or MongoDB database with transactional ACID compliance for concurrent lecture edits.
  * Redis pub/sub layer for multi-user WebSockets broadcasting.

### 2. Cryptographic Security & True Session Authentication
* **Current State**: Passwords are stored in plaintext in `localStorage` for demonstration purposes. The default password is `password123`. OTP verification is simulated locally.
* **Future Implementation**:
  * Hashed passwords using bcrypt or Argon2.
  * Stateless JWT authentication tokens with HTTP-only cookies and CSRF protection.
  * Institutional Single Sign-On (SSO) via Google Workspace (OAuth2) or Microsoft 365 (SAML/Azure AD).

### 3. External Communication Gateways (SMS / WhatsApp / Email)
* **Current State**: Notifications appear as in-app toast alerts, banners, and entries in the topbar Bell Notification Drawer.
* **Future Implementation**:
  * Twilio or AWS SNS integration for automated SMS delivery to student and parent phone numbers.
  * WhatsApp Business API for emergency schedule changes.
  * SendGrid / AWS SES integration for official email notices.

### 4. Biometric & RFID Attendance Tracking
* **Current State**: Attendance tracking is not simulated; the system focuses on timetable scheduling, conflict management, and room allocation.
* **Future Implementation**:
  * RFID/NFC card swipe or biometric fingerprint reader integration at classroom doors.
  * Student attendance threshold calculations (e.g., flagging students below 75% attendance).

### 5. Examination Timetable & Fee Payment Management
* **Current State**: Examination models exist in `mockData.ts`, but the exam scheduling workflow was omitted from student and teacher dashboards to keep the focus on conflict-free lecture operations.
* **Future Implementation**:
  * Automatic exam seating arrangement generator.
  * Payment gateway integration (Razorpay / Stripe) for semester tuition fee processing.

### 6. Calendar Export & Third-Party Sync
* **Current State**: Timetables are viewable only within the SyncCampus web UI.
* **Future Implementation**:
  * iCalendar (`.ics`) file generation.
  * Two-way synchronization with Google Calendar, Microsoft Outlook, and Apple Calendar.

---

## 📁 Complete Workspace Directory & File Map

```
newSyncampus/
├── README.md                                      # Comprehensive platform documentation (this file)
├── SyncCampus_Development_Plan.md                 # Original architecture specification & milestones
├── SyncCampus_Project_Overview.md                 # High-level product overview
├── Logic.txt                                      # Timetable rules, departments, and course curricula
├── dataFake/
│   ├── college.txt                                # Official source data for teachers, rooms, & departments
│   └── Student_data.txt                           # Official source data for all 2,700 enrolled students
├── client/
│   ├── package.json                               # Client dependencies (React 19, Lucide, Vite)
│   ├── tsconfig.json                              # TypeScript strict configuration
│   ├── vite.config.ts                             # Vite bundling configuration
│   ├── index.html                                 # Single page application entry HTML
│   └── src/
│       ├── main.tsx                               # React root mounting point
│       ├── index.css                              # Design system tokens, variables, & resets
│       ├── App.tsx                                # Root application router & session controller
│       ├── App.css                                # Root application layout styling
│       ├── data/
│       │   ├── mockData.ts                        # Interfaces, metrics, and INITIAL_CLASSROOMS (62 spaces)
│       │   ├── teachersData.ts                    # 72 faculty profiles and query helpers
│       │   ├── studentsData.ts                    # 2,700 student records and query helpers
│       │   ├── curriculumData.ts                  # Course semester subject configurations
│       │   ├── timetableData.ts                   # Master conflict-free timetable (1,275 lectures)
│       │   ├── timetableStore.ts                  # Reactive scheduling store & conflict detection engine
│       │   └── userProfileStore.ts                # Profile settings, avatar storage, & password manager
│       └── components/
│           ├── LoginPage.tsx                      # Universal login with live search & autocomplete
│           ├── LoginPage.css                      # Modern glassmorphism login styling
│           ├── common/
│           │   └── NotificationDrawer.tsx         # Slide-out alert drawer (Active vs Past history)
│           ├── student/
│           │   ├── StudentDashboard.tsx           # Student layout, topbar with bell, & navigation
│           │   ├── StudentDashboard.css           # Student portal responsive styling
│           │   └── views/
│           │       ├── StudentHomeView.tsx        # Daily schedule, period timeline, & quick cards
│           │       ├── StudentTimetableView.tsx   # Weekly grid & thumb-friendly mobile daily list
│           │       └── StudentProfileView.tsx     # Contact info, avatar upload, & password change
│           ├── teacher/
│           │   ├── TeacherDashboard.tsx           # Faculty layout, topbar with bell, & schedule actions
│           │   ├── TeacherDashboard.css           # Faculty portal responsive styling
│           │   ├── modals/
│           │   │   ├── TeacherCancelModal.tsx     # Reason selection & broadcast for cancellation
│           │   │   ├── TeacherChangeRoomModal.tsx # Vacancy filter, clash warning, & room reallocation
│           │   │   └── TeacherRescheduleModal.tsx # Real-time multi-dimensional conflict-free reschedule
│           │   └── views/
│           │       ├── TeacherHomeView.tsx        # Faculty daily schedule & teaching metrics
│           │       ├── TeacherTimetableView.tsx   # Faculty weekly timetable & mobile list view
│           │       ├── TeacherClassesView.tsx     # Student cohorts & division breakdown
│           │       └── TeacherProfileView.tsx     # Faculty preferences, avatar, & password change
│           └── admin/
│               ├── AdminDashboard.tsx             # Campus administration command center
│               ├── AdminDashboard.css             # Administration console styling
│               ├── modals/
│               │   ├── CreateLectureModal.tsx     # New lecture creator with conflict checking
│               │   ├── RescheduleModal.tsx        # Admin reschedule modal with conflict check
│               │   ├── AddTeacherModal.tsx        # Add new professor to roster
│               │   ├── AddStudentModal.tsx        # Add new student to cohort
│               │   ├── AddClassroomModal.tsx      # Add physical room / laboratory
│               │   ├── AddDivisionModal.tsx       # Add class division
│               │   └── AddAnnouncementModal.tsx   # Create campus broadcast
│               └── views/
│                   ├── OverviewView.tsx           # Campus analytics, active counters, & activity feed
│                   ├── TimetableView.tsx          # Multi-division master scheduling grid
│                   ├── FacultyView.tsx            # Directory & workload of 72 teachers
│                   ├── StudentsView.tsx           # Directory of 2,700 students with pagination
│                   ├── ClassroomsView.tsx         # Physical room occupancy matrix
│                   ├── DivisionsView.tsx          # 51 academic divisions breakdown
│                   ├── CurriculumView.tsx         # Degree programs & subject structure
│                   └── SettingsView.tsx           # Institution configuration
└── scratch/
    ├── test_room_conflict.js                      # Automated node test script for room conflicts
    └── test_profile_and_notifications.js          # Automated node test script for profile store
```

---

## 💻 Installation, Development & Build Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### 1. Installation
Navigate to the `client` directory and install dependencies:
```bash
cd d:\Programs_file_code\Antigravity\newSyncampus\client
npm install
```

### 2. Running Locally (Development Mode)
Launch the Vite development server with Hot Module Replacement:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173/
```

### 3. Production Build
Compile TypeScript and bundle optimized assets:
```bash
npm run build
```
The production bundle will be generated in `client/dist/`.

### 4. Running Automated Verification Scripts
Verify the conflict detection engine and profile persistence logic via Node:
```bash
node scratch/test_room_conflict.js
node scratch/test_profile_and_notifications.js
```

---

## 🔑 Quick-Access Demo Credentials

### Student Portal Demo Accounts:
* **Email**: `stu0001@sonopantcollege.edu.in` | **ID**: `STU0001` | **Name**: `Yash Pawar` (BSc IT FY Div A)
* **Email**: `stu0055@sonopantcollege.edu.in` | **ID**: `STU0055` | **Name**: `Aniket Sharma` (BSc IT SY Div A)
* **Password**: `password123` (or any value after updating in profile)

### Faculty Portal Demo Accounts:
* **Email**: `rahul.patil.t001@campus.edu` | **ID**: `T001` | **Name**: `Prof. Rahul Patil` (Science & Tech)
* **Email**: `neha.kulkarni.t004@campus.edu` | **ID**: `T004` | **Name**: `Prof. Neha Kulkarni` (Science & Tech)
* **Email**: `meera.kulkarni.t031@campus.edu` | **ID**: `T031` | **Name**: `Prof. Meera Kulkarni` (Commerce)
* **Password**: `password123` (or any value after updating in profile)

### Admin Portal:
* **Email**: `admin@campus.edu` | **Role**: Campus Administrator (Email OTP Verification)

---

*SyncCampus © 2026. Built with React 19, TypeScript, and Vite.*
