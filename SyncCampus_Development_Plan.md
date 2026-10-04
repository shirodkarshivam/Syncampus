# SyncCampus — Complete Website Development Plan

> **Source Documents:**
> - [SyncCampus_Project_Overview.md](file:///d:/Programs_file_code/Antigravity/newSyncampus/SyncCampus_Project_Overview.md) — Architecture and technical spec
> - [Logic.txt](file:///d:/Programs_file_code/Antigravity/newSyncampus/Logic.txt) — Full functional logic (67 sections)
> - [Admin_dashboard.txt](file:///d:/Programs_file_code/Antigravity/newSyncampus/Design_Idea/Admin_dashboard.txt) — Admin UI spec
> - [Teacher_dashboard.txt](file:///d:/Programs_file_code/Antigravity/newSyncampus/Design_Idea/Teacher_dashboard.txt) — Teacher UI spec
> - [student-dashboard.txt](file:///d:/Programs_file_code/Antigravity/newSyncampus/Design_Idea/student-dashboard.txt) — Student UI spec
> - [login.txt](file:///d:/Programs_file_code/Antigravity/newSyncampus/Design_Idea/login.txt) — Login/Auth UI spec

---

## Table of Contents

| # | Phase | Focus |
|:--|:------|:------|
| 0 | Project Scaffolding | Monorepo, tooling, design system |
| 1 | Database Design | Prisma schema, migrations, seed |
| 2 | Authentication | Email OTP, JWT, RBAC |
| 3 | Academic Hierarchy | Departments, courses, rooms, users |
| 4 | Weekly Timetable Engine | Master schedule, merge algorithm |
| 5 | Exception Engine | Cancel, reschedule, room change |
| 6 | Conflict Detection | 4-way conflict checker, concurrency |
| 7 | Realtime Layer | Socket.IO, live push |
| 8 | Notifications and Announcements | Auto-notify, audience targeting |
| 9 | Examinations | Exam CRUD, conflict, publish |
| 10 | Frontend: Login | Role select, OTP, protected routes |
| 11 | Frontend: Student | Read-only timetable, live updates |
| 12 | Frontend: Teacher | Action modals, conflict preview |
| 13 | Frontend: Admin | Full management panel |
| 14 | Testing and Edge Cases | 20 test scenarios |
| 15 | Deployment | Hosting, security, monitoring |

---

## Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Frontend** | React 18 + TypeScript + Vite | SPA with role-based rendering |
| **Routing** | React Router v6 | Client-side navigation with protected routes |
| **State** | Zustand | Lightweight global state for auth, notifications |
| **Styling** | Vanilla CSS (custom design system) | Clean, modern Google-style UI |
| **Backend** | Node.js + Express + TypeScript | REST API + WebSocket server |
| **ORM** | Prisma | Type-safe database access, migrations |
| **Database** | PostgreSQL | ACID transactions, relational integrity |
| **Realtime** | Socket.IO | Live push updates to connected clients |
| **Auth** | JWT (access + refresh tokens) | Stateless auth with role claims |
| **Email** | Nodemailer (or Resend/SendGrid) | OTP delivery |
| **Validation** | Zod | Request body and param validation |
| **Testing** | Vitest + Supertest + Playwright | Full coverage |

---

## Folder Structure

```
newSyncampus/
├── client/                         # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                 # Icons, images, fonts
│   │   ├── components/
│   │   │   ├── ui/                 # Button, Modal, Card, Badge, Input
│   │   │   ├── layout/            # Sidebar, Topbar, PageWrapper
│   │   │   └── timetable/         # TimetableGrid, LectureCard, StatusBadge
│   │   ├── pages/
│   │   │   ├── auth/              # Login, OTPVerify
│   │   │   ├── student/           # StudentDashboard, StudentTimetable
│   │   │   ├── teacher/           # TeacherDashboard, TeacherTimetable
│   │   │   └── admin/             # AdminDashboard, ManageUsers, etc.
│   │   ├── hooks/                 # useAuth, useSocket, useTimetable
│   │   ├── services/              # API client (axios), socket client
│   │   ├── store/                 # Zustand stores
│   │   ├── utils/                 # Date helpers, formatters
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── Router.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                         # Node.js + Express backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/                # env, database, email
│   │   ├── middleware/            # auth, rbac, errorHandler, rateLimiter
│   │   ├── modules/
│   │   │   ├── auth/              # controller, service, routes, validators
│   │   │   ├── users/
│   │   │   ├── departments/
│   │   │   ├── courses/
│   │   │   ├── divisions/
│   │   │   ├── batches/
│   │   │   ├── subjects/
│   │   │   ├── rooms/
│   │   │   ├── timetable/         # weekly timetable CRUD
│   │   │   ├── exceptions/        # lecture exception engine
│   │   │   ├── conflicts/         # conflict detection service
│   │   │   ├── notifications/
│   │   │   ├── announcements/
│   │   │   ├── examinations/
│   │   │   └── audit/             # change history
│   │   ├── socket/                # Socket.IO setup
│   │   ├── utils/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                         # Shared types
│   └── types.ts
└── package.json                    # Root workspace
```

---

## Phase 0 — Project Scaffolding

### Tasks
1. Initialize monorepo with npm workspaces
2. Scaffold client with `npx -y create-vite@latest ./client -- --template react-ts`
3. Initialize server with Express, TypeScript, Prisma, Socket.IO
4. Create .env files for DB URL, JWT secret, SMTP credentials
5. Set up ESLint + Prettier
6. Create base CSS design system

### Design System Tokens
```css
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #eff6ff;
  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-danger: #dc2626;
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --font-family: 'Inter', system-ui, sans-serif;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08);
}
```

### Deliverables
- [ ] npm run dev starts both client + server
- [ ] Database connection verified
- [ ] Base CSS design system created
- [ ] Google Font (Inter) loaded

---

## Phase 1 — Database Design and Migrations

### Complete Prisma Schema

```prisma
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  role          Role
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  teacher       Teacher?
  student       Student?
  otps          Otp[]
  changedBy     LectureException[]  @relation("ChangedBy")
  notifications Notification[]
  auditLogs     ChangeHistory[]
}

enum Role { STUDENT  TEACHER  ADMIN  HOD }

model Otp {
  id        String   @id @default(uuid())
  userId    String
  code      String
  expiresAt DateTime
  attempts  Int      @default(0)
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model Department {
  id        String   @id @default(uuid())
  name      String   @unique
  code      String   @unique
  createdAt DateTime @default(now())
  courses   Course[]
  teachers  Teacher[]
}

model Course {
  id             String   @id @default(uuid())
  name           String
  code           String   @unique
  departmentId   String
  totalSemesters Int      @default(6)
  createdAt      DateTime @default(now())
  department     Department @relation(fields: [departmentId], references: [id])
  divisions      Division[]
  subjects       Subject[]
  examinations   Examination[]
}

model Division {
  id           String   @id @default(uuid())
  name         String
  courseId      String
  semester     Int
  academicYear String
  createdAt    DateTime @default(now())
  course       Course   @relation(fields: [courseId], references: [id])
  batches      Batch[]
  students     Student[]
  timetableEntries WeeklyTimetable[]
}

model Batch {
  id         String   @id @default(uuid())
  name       String
  divisionId String
  createdAt  DateTime @default(now())
  division   Division @relation(fields: [divisionId], references: [id])
  students   Student[]
  timetableEntries WeeklyTimetable[]
}

model Teacher {
  id           String   @id @default(uuid())
  userId       String   @unique
  departmentId String
  employeeId   String   @unique
  user         User       @relation(fields: [userId], references: [id])
  department   Department @relation(fields: [departmentId], references: [id])
  subjects     TeacherSubject[]
  timetableEntries WeeklyTimetable[]
}

model TeacherSubject {
  id        String @id @default(uuid())
  teacherId String
  subjectId String
  teacher   Teacher @relation(fields: [teacherId], references: [id])
  subject   Subject @relation(fields: [subjectId], references: [id])
  @@unique([teacherId, subjectId])
}

model Student {
  id         String   @id @default(uuid())
  userId     String   @unique
  studentId  String   @unique
  divisionId String
  batchId    String?
  user       User     @relation(fields: [userId], references: [id])
  division   Division @relation(fields: [divisionId], references: [id])
  batch      Batch?   @relation(fields: [batchId], references: [id])
}

model Subject {
  id       String @id @default(uuid())
  name     String
  code     String @unique
  courseId  String
  semester Int
  course   Course @relation(fields: [courseId], references: [id])
  teachers TeacherSubject[]
  timetableEntries WeeklyTimetable[]
  examinations Examination[]
}

model Room {
  id       String     @id @default(uuid())
  name     String     @unique
  building String?
  capacity Int
  type     RoomType   @default(CLASSROOM)
  status   RoomStatus @default(AVAILABLE)
  timetableEntries WeeklyTimetable[]
  exceptions       LectureException[]
  examinations     Examination[]
}

enum RoomType   { CLASSROOM  LABORATORY  AUDITORIUM }
enum RoomStatus { AVAILABLE  MAINTENANCE  UNAVAILABLE }

model WeeklyTimetable {
  id           String  @id @default(uuid())
  subjectId    String
  teacherId    String
  divisionId   String
  batchId      String?
  roomId       String
  weekday      Int
  startTime    String
  endTime      String
  academicYear String
  isActive     Boolean @default(true)
  subject    Subject  @relation(fields: [subjectId], references: [id])
  teacher    Teacher  @relation(fields: [teacherId], references: [id])
  division   Division @relation(fields: [divisionId], references: [id])
  batch      Batch?   @relation(fields: [batchId], references: [id])
  room       Room     @relation(fields: [roomId], references: [id])
  exceptions LectureException[]
}

model LectureException {
  id                String          @id @default(uuid())
  weeklyTimetableId String
  exceptionDate     DateTime        @db.Date
  status            ExceptionStatus
  newStartTime      String?
  newEndTime        String?
  newRoomId         String?
  newWeekday        Int?
  newDate           DateTime?       @db.Date
  reason            String?
  changedByUserId   String
  createdAt         DateTime        @default(now())
  weeklyTimetable   WeeklyTimetable @relation(fields: [weeklyTimetableId], references: [id])
  newRoom           Room?           @relation(fields: [newRoomId], references: [id])
  changedBy         User            @relation("ChangedBy", fields: [changedByUserId], references: [id])
  changeHistory     ChangeHistory[]
  @@unique([weeklyTimetableId, exceptionDate])
}

enum ExceptionStatus { CANCELLED  RESCHEDULED  ROOM_CHANGED }

model ChangeHistory {
  id           String   @id @default(uuid())
  exceptionId  String
  changedById  String
  fieldChanged String
  oldValue     String
  newValue     String
  timestamp    DateTime @default(now())
  exception    LectureException @relation(fields: [exceptionId], references: [id])
  changedBy    User             @relation(fields: [changedById], references: [id])
}

model Notification {
  id        String               @id @default(uuid())
  userId    String
  title     String
  message   String
  type      NotificationType
  priority  NotificationPriority @default(NORMAL)
  isRead    Boolean              @default(false)
  metadata  Json?
  createdAt DateTime             @default(now())
  user      User                 @relation(fields: [userId], references: [id])
}

enum NotificationType     { LECTURE_CANCELLED  LECTURE_RESCHEDULED  ROOM_CHANGED  EXAM_UPDATED  ANNOUNCEMENT }
enum NotificationPriority { NORMAL  IMPORTANT  CRITICAL }

model Announcement {
  id           String              @id @default(uuid())
  title        String
  message      String
  audienceType AnnouncementAudience
  departmentId String?
  courseId     String?
  semester    Int?
  divisionId  String?
  publishedAt DateTime             @default(now())
  createdById String
}

enum AnnouncementAudience { COLLEGE  DEPARTMENT  COURSE  SEMESTER  DIVISION }

model Examination {
  id        String     @id @default(uuid())
  subjectId String
  courseId   String
  semester  Int
  roomId    String
  date      DateTime   @db.Date
  startTime String
  endTime   String
  status    ExamStatus @default(DRAFT)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  subject   Subject    @relation(fields: [subjectId], references: [id])
  course    Course     @relation(fields: [courseId], references: [id])
  room      Room       @relation(fields: [roomId], references: [id])
}

enum ExamStatus { DRAFT  PUBLISHED  CANCELLED  COMPLETED }
```

### Deliverables
- [ ] schema.prisma finalized
- [ ] Migration generated (npx prisma migrate dev)
- [ ] seed.ts with sample data
- [ ] Prisma Client generated

---

## Phase 2 — Authentication System (Email + OTP)

### Endpoints

| Method | Route | Access | Description |
|:---|:---|:---|:---|
| POST | /api/auth/request-otp | Public | Send OTP to email |
| POST | /api/auth/verify-otp | Public | Verify OTP, return JWT |
| POST | /api/auth/refresh | Auth | Refresh access token |
| POST | /api/auth/logout | Auth | Invalidate refresh token |
| GET | /api/auth/me | Auth | Get current user profile |

### Auth Flow (Logic.txt sections 3-6)

1. User selects role (Student / Teacher / Admin)
2. Enters registered email
3. System checks: account exists with matching role?
   - No: Error (account not found or role mismatch)
   - Yes: Generate 6-digit OTP
4. Store OTP in DB (code, expiresAt=now+5min, attempts=0)
5. Send OTP via email
6. User enters OTP
7. Verify: OTP correct, not expired, attempts less than 5?
   - Wrong: Increment attempts (lock after 5 for 15 min)
   - Expired: Request new OTP
   - Valid: Mark verified, issue JWT access + refresh token
8. Redirect to role-appropriate dashboard

### JWT Structure
- Access token (1hr): sub, role, name, iat, exp
- Refresh token (7d): stored in httpOnly cookie

### RBAC Middleware
```typescript
export const requireRole = (...roles: Role[]) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};
```

### Deliverables
- [ ] OTP generation and email sending
- [ ] OTP verification with rate limiting and expiry
- [ ] JWT issuance and refresh
- [ ] RBAC middleware on every route
- [ ] Account lockout after 5 failed attempts
- [ ] Role mismatch detection

---

## Phase 3 — Academic Hierarchy CRUD (Admin)

### Endpoints

| Entity | GET | POST | PATCH | DELETE |
|:---|:---|:---|:---|:---|
| Departments | /api/departments | Yes | Yes | Yes (if no children) |
| Courses | /api/courses?departmentId= | Yes | Yes | — |
| Divisions | /api/divisions?courseId= | Yes | Yes | — |
| Batches | /api/batches?divisionId= | Yes | — | — |
| Subjects | /api/subjects?courseId= | Yes | Yes | — |
| Rooms | /api/rooms?status= | Yes | Yes | — |
| Users | /api/users?role=search= | Yes | Yes | — |

### Special Endpoints
- PATCH /api/users/:id/deactivate — Deactivate with upcoming lecture check
- POST /api/users/bulk-promote — Bulk semester promotion

### Important Rules
- When deactivating a teacher: warn about N upcoming assigned lectures
- When marking room unavailable: warn about N upcoming lectures in that room

### Deliverables
- [ ] Full CRUD for all hierarchy entities
- [ ] Cascading filters (dept to course to semester to division)
- [ ] Room status management with conflict warnings
- [ ] User deactivation safeguards
- [ ] Bulk student promotion

---

## Phase 4 — Master Weekly Timetable Engine

This is the central source of truth (Logic.txt sections 7-8).

### Endpoints

| Method | Route | Access | Description |
|:---|:---|:---|:---|
| GET | /api/timetable/weekly | All | Weekly entries |
| GET | /api/timetable/daily?date= | All | Merged view (base + exceptions) |
| GET | /api/timetable/teacher/:id | Teacher/Admin | Teacher schedule |
| GET | /api/timetable/student/me | Student | Auto-filtered by division |
| POST | /api/timetable/weekly | Admin | Create entry |
| PATCH | /api/timetable/weekly/:id | Admin | Edit entry |
| DELETE | /api/timetable/weekly/:id | Admin | Remove entry |

### The Merge Algorithm (Core Logic)

```typescript
async function getDailyTimetable(divisionId: string, date: Date) {
  const weekday = date.getDay();

  // 1. Get weekly entries for this division on this weekday
  const entries = await prisma.weeklyTimetable.findMany({
    where: { divisionId, weekday, isActive: true },
    include: { subject: true, teacher: { include: { user: true } }, room: true }
  });

  // 2. Get exceptions for this date
  const exceptions = await prisma.lectureException.findMany({
    where: {
      weeklyTimetableId: { in: entries.map(e => e.id) },
      exceptionDate: date
    },
    include: { newRoom: true }
  });

  // 3. Build exception map
  const exMap = new Map(exceptions.map(e => [e.weeklyTimetableId, e]));

  // 4. Merge: apply overrides on top of base entries
  return entries.map(entry => {
    const ex = exMap.get(entry.id);
    if (!ex) return { ...entry, status: 'SCHEDULED', exception: null };
    return {
      ...entry,
      status: ex.status,
      room: ex.newRoom ?? entry.room,
      startTime: ex.newStartTime ?? entry.startTime,
      endTime: ex.newEndTime ?? entry.endTime,
      exception: ex,
    };
  });
}
```

### Auto-Status Computation

```typescript
function computeStatus(lecture, now: Date): string {
  if (lecture.status === 'CANCELLED') return 'CANCELLED';
  if (lecture.status === 'RESCHEDULED') return 'RESCHEDULED';
  const start = parseTime(lecture.startTime, lecture.date);
  const end = parseTime(lecture.endTime, lecture.date);
  if (now < start) return 'UPCOMING';
  if (now >= start && now <= end) return 'ONGOING';
  return 'COMPLETED';
}
```

### Deliverables
- [ ] Weekly timetable CRUD
- [ ] Daily merged view API (base + exceptions)
- [ ] Student auto-filter by division/batch
- [ ] Teacher auto-filter by assignment
- [ ] Computed status: Upcoming / Ongoing / Completed / Cancelled / Rescheduled
- [ ] Next lecture computation

---

## Phase 5 — Lecture Exception Engine

Implements the one-day exception model (Logic.txt sections 22-25).

**Key principle**: The weekly_timetable master row is NEVER modified. Only lecture_exceptions rows are created. Next week resets automatically.

### Endpoints

| Method | Route | Access | Description |
|:---|:---|:---|:---|
| POST | /api/lectures/:id/cancel | Teacher (own), Admin | Cancel for a specific date |
| POST | /api/lectures/:id/reschedule | Teacher (own), Admin | Reschedule to new time/date |
| POST | /api/lectures/:id/change-room | Teacher (own), Admin | Change classroom |

### Cancel Flow
1. Permission check (own lecture or admin)
2. Create exception: status=CANCELLED
3. Audit log
4. Find affected students (division/batch)
5. Bulk create notifications
6. WebSocket broadcast to division room

### Reschedule Flow
1. Permission check
2. RUN CONFLICT DETECTION (Phase 6)
3. If conflicts: return 409 with details
4. Create exception: status=RESCHEDULED
5. Audit log
6. Notify affected users
7. WebSocket broadcast

### Room Change Flow
1. Permission check
2. Check room availability at lecture time
3. If occupied: return 409
4. Create exception: status=ROOM_CHANGED
5. Audit log + notify + broadcast

### Deliverables
- [ ] Cancel API (with reason, notification, audit)
- [ ] Reschedule API (with conflict check)
- [ ] Change room API (with availability check)
- [ ] Permission: teachers modify only their own lectures
- [ ] Unique constraint: one exception per entry per date
- [ ] Audit trail for every change

---

## Phase 6 — Conflict Detection Engine

The most critical backend module (Logic.txt sections 14, 36-38).

### 4-Way Conflict Checker Flow

1. Submit Change
2. Authorized? No = 403
3. Teacher free at new time? No = Conflict: teacher already teaching
4. Room free at new time? No = Conflict: room occupied
5. Division/Batch free? No = Conflict: class has another lecture
6. No exam conflict? No = Conflict: exam in this room
7. All clear = Save + Notify + Broadcast

### Core Interface
```typescript
interface ConflictCheck {
  date: Date;
  startTime: string;
  endTime: string;
  teacherId: string;
  roomId: string;
  divisionId: string;
  batchId?: string;
  excludeId?: string;
}
```

### Concurrency Handling (Race Conditions)
```typescript
// Database-level advisory locks
await prisma.$transaction(async (tx) => {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(
    hashtext(${roomId + date + startTime})
  )`;
  // Re-check conflicts inside transaction
  // Create exception if clear
}, { isolationLevel: 'Serializable' });
```

### Deliverables
- [ ] 4-way detection (teacher, room, division, exam)
- [ ] Time overlap algorithm
- [ ] PostgreSQL advisory locks for concurrent writes
- [ ] Descriptive error responses with conflicting details
- [ ] Integrated into all mutation endpoints

---

## Phase 7 — Realtime WebSocket Layer

### Socket.IO Setup
```typescript
io.use(socketAuthMiddleware);
io.on('connection', (socket) => {
  const user = socket.data.user;
  if (user.role === 'STUDENT') {
    socket.join(`division:${user.divisionId}`);
    if (user.batchId) socket.join(`batch:${user.batchId}`);
  }
  if (user.role === 'TEACHER') {
    socket.join(`teacher:${user.teacherId}`);
    user.teachingDivisionIds.forEach(id => socket.join(`division:${id}`));
  }
  if (user.role === 'ADMIN') socket.join('admin');
  socket.join(`user:${user.id}`);
});
```

### Server Events

| Event | Sent To | Trigger |
|:---|:---|:---|
| timetable:updated | division:{id}, teacher:{id} | Lecture modified |
| notification:new | user:{id} | Notification created |
| announcement:new | Target audience rooms | Announcement published |
| exam:updated | Affected divisions | Exam changed |
| admin:activity | admin room | Any system change |

### Frontend Hook
```typescript
export function useSocket() {
  const { token } = useAuthStore();
  useEffect(() => {
    const socket = io(BACKEND_URL, { auth: { token } });
    socket.on('timetable:updated', (data) => {
      useTimetableStore.getState().invalidateDate(data.date);
    });
    socket.on('notification:new', (n) => {
      useNotificationStore.getState().add(n);
    });
    return () => socket.disconnect();
  }, [token]);
}
```

### Deliverables
- [ ] Socket.IO with JWT auth
- [ ] Role-based room auto-join
- [ ] Timetable update broadcast
- [ ] Live notification delivery
- [ ] Admin activity feed
- [ ] Auto-reconnection on frontend

---

## Phase 8 — Notification and Announcement System

### Auto-Notification Logic
```typescript
async function notifyAffectedUsers(event, lectureEntry, details) {
  const students = await getAffectedStudents(
    lectureEntry.divisionId, lectureEntry.batchId
  );
  await prisma.notification.createMany({
    data: [...students, lectureEntry.teacher].map(u => ({
      userId: u.userId,
      title: buildTitle(event),
      message: buildMessage(event, details),
      type: event,
      priority: event === 'EXAM_UPDATED' ? 'CRITICAL' : 'IMPORTANT',
    }))
  });
  students.forEach(s =>
    io.to(`user:${s.userId}`).emit('notification:new', notification)
  );
}
```

### Notification Endpoints

| Method | Route | Description |
|:---|:---|:---|
| GET | /api/notifications | Paginated list |
| GET | /api/notifications/unread-count | Unread badge count |
| PATCH | /api/notifications/:id/read | Mark read |
| PATCH | /api/notifications/read-all | Mark all read |

### Announcement Endpoints (Admin)

| Method | Route | Description |
|:---|:---|:---|
| GET | /api/announcements | Relevant announcements |
| POST | /api/announcements | Create with audience targeting |
| DELETE | /api/announcements/:id | Delete |

### Audience Targeting
College to Department to Course to Semester to Division (cascading filter)

### Deliverables
- [ ] Auto recipient determination
- [ ] Priority levels (Normal, Important, Critical)
- [ ] Read/unread management
- [ ] Audience-targeted announcements
- [ ] Auto-notification on publish

---

## Phase 9 — Examination Module

### Endpoints

| Method | Route | Description |
|:---|:---|:---|
| GET | /api/examinations | List exams |
| POST | /api/examinations | Create exam |
| PATCH | /api/examinations/:id | Update details |
| PATCH | /api/examinations/:id/publish | Publish schedule |
| PATCH | /api/examinations/:id/cancel | Cancel exam |

### Conflict Checks
- Room availability (no lecture or other exam)
- Student schedule conflicts

### Deliverables
- [ ] Exam CRUD with conflict detection
- [ ] Status lifecycle: Draft to Published to Completed / Cancelled
- [ ] Notification on publish/change
- [ ] Exam-room blocking for lectures

---

## Phase 10 — Frontend: Login and Auth Pages

### Routes

| Route | Page |
|:---|:---|
| /login | Role Selection (Student / Teacher / Admin) |
| /login/:role | Email Entry |
| /login/:role/verify | OTP Verification |

### Components
- **RoleSelector** — 3 cards with icons, hover effects
- **EmailForm** — Single input, SyncCampus branding
- **OTPInput** — 6 digit inputs with auto-focus
- **AuthLayout** — Centered white card on light bg

### Protected Routes
```typescript
function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to={`/${user.role.toLowerCase()}`} />;
  return children;
}
```

### Deliverables
- [ ] Role selection page
- [ ] Email input with mismatch handling
- [ ] OTP input with timer and resend
- [ ] JWT in memory + refresh in httpOnly cookie
- [ ] Protected route redirects

---

## Phase 11 — Frontend: Student Dashboard

### Routes

| Route | Page |
|:---|:---|
| /student | Dashboard (today's overview) |
| /student/timetable | Weekly timetable |
| /student/notifications | All notifications |
| /student/announcements | Announcements |
| /student/exams | Exam schedule |

### Dashboard Sections
1. **Greeting** — "Good morning, Shivam" + date
2. **Current/Next Lecture** — Large card with room, subject, teacher, countdown
3. **Today's Schedule** — Timeline with status badges
4. **Recent Changes** — Timetable modifications
5. **Notification Bell** — Unread count badge

### Status Badges

| Status | Visual |
|:---|:---|
| Scheduled | Green dot |
| Ongoing | Pulsing blue |
| Completed | Grey/muted |
| Cancelled | Red + strikethrough |
| Rescheduled | Orange + "Moved to 2:00 PM" |
| Room Changed | Blue + "Room 204 to 305" |

### Empty State
"No classes today" (Logic.txt section 39)

### Deliverables
- [ ] Auto-fetch by division/batch
- [ ] Live current/next lecture display
- [ ] Status-coded lecture cards
- [ ] Weekly grid view
- [ ] Notification list
- [ ] WebSocket live updates
- [ ] Mobile-first responsive

---

## Phase 12 — Frontend: Teacher Dashboard

### Routes

| Route | Page |
|:---|:---|
| /teacher | Dashboard + quick actions |
| /teacher/timetable | Weekly schedule |
| /teacher/notifications | Notifications |

### Action Modals

**Cancel Modal:**
- Shows lecture details (subject, time, room, class)
- Reason input field (optional)
- Affected student count warning
- Go Back / Confirm Cancel buttons

**Reschedule Modal:**
- Shows current schedule
- New Date, New Time, New Room selectors
- Live conflict detection display
- Go Back / Confirm Reschedule buttons

**Change Room Modal:**
- Shows current room
- List of rooms with capacity and availability status
- Radio selection for available rooms
- Go Back / Confirm Change buttons

### Deliverables
- [ ] Teacher-only lecture view
- [ ] Cancel modal with reason + affected count
- [ ] Reschedule modal with live conflict checking
- [ ] Room change modal with availability
- [ ] Optimistic UI + rollback on error
- [ ] Double-click protection (Logic.txt section 41)
- [ ] WebSocket for admin changes

---

## Phase 13 — Frontend: Admin Dashboard

### Routes

| Route | Page |
|:---|:---|
| /admin | Dashboard overview |
| /admin/timetable | Timetable management |
| /admin/timetable/create | Create lecture |
| /admin/students | Student management |
| /admin/teachers | Teacher management |
| /admin/classrooms | Room management |
| /admin/exams | Exam management |
| /admin/announcements | Announcements |
| /admin/reports | Reports |
| /admin/settings | Settings |

### Layout
```
Sidebar (left):
  Dashboard, Timetable, Students, Teachers,
  Rooms, Exams, Announcements, Reports, Settings, Logout

Main content (right):
  Greeting + Campus Overview cards (Students, Teachers, Classes, Rooms)
  Quick Actions (Create Lecture, Edit Timetable, etc.)
  Today's Schedule summary (Scheduled / Rescheduled / Cancelled counts)
  Recent Activity feed (WebSocket-powered)
```

### Key UX Rules
- Confirmation modals showing affected user count (Logic.txt section 28)
- Live conflict detection as admin fills forms
- Stale data warning when another admin modified same lecture (Logic.txt section 42)
- Sidebar converts to hamburger menu on mobile

### Deliverables
- [ ] Sidebar layout with all nav items
- [ ] Campus overview with live stats
- [ ] Quick actions
- [ ] Timetable CRUD with cascading filters
- [ ] Create lecture form with live conflict preview
- [ ] Student/Teacher/Room management with search
- [ ] Announcement creation with audience targeting
- [ ] Exam management
- [ ] Activity feed (WebSocket)
- [ ] Reports page
- [ ] Confirmation modals with user count

---

## Phase 14 — Integration Testing and Edge Cases

### 20 Test Scenarios

| # | Scenario | Expected |
|:--|:---------|:---------|
| 1 | Teacher cancels Monday DBMS | Only that Monday cancelled; next Monday normal |
| 2 | Teacher A edits Teacher B's lecture | 403 Forbidden |
| 3 | Student calls mutation API | 403 Forbidden |
| 4 | Teacher reschedules to occupied slot | 409 with conflict detail |
| 5 | Move lecture to occupied room | 409 Conflict |
| 6 | Two lectures same division same time | 409 Conflict |
| 7 | Lecture in exam room during exam | 409 Conflict |
| 8 | Two teachers request same room at once | Exactly 1 succeeds |
| 9 | Shift Batch B1 practical | Only B1 view updates |
| 10 | Student opens after room change | Sees new room + notification |
| 11 | Admin marks room Maintenance | Warns about N lectures |
| 12 | Admin deactivates teacher | Warns about N lectures |
| 13 | Student moved Div A to Div B | Immediately sees Div B timetable |
| 14 | Admin double-clicks Create | Only 1 lecture created |
| 15 | Two admins edit same lecture | Second gets stale data warning |
| 16 | OTP entered after 5 min | OTP expired error |
| 17 | 5+ wrong OTP attempts | Account locked 15 min |
| 18 | Student navigates to /admin | Redirected to student dashboard |
| 19 | Action during network drop | Unable to save error |
| 20 | No lectures today | Shows "No classes today" |

### Testing Tools
- **Vitest** — Unit tests (conflict engine, merge algorithm)
- **Supertest** — API integration tests
- **Playwright** — E2E browser tests
- **Artillery** — Concurrency/load tests

---

## Phase 15 — Deployment and Production Readiness

### Infrastructure

| Component | Option |
|:---|:---|
| Frontend | Vercel or Netlify |
| Backend | Railway, Render, or DigitalOcean |
| Database | Supabase PostgreSQL or Neon |
| Email | Resend or SendGrid |
| Domain | Custom with SSL |

### Checklist
- [ ] Environment variables secured
- [ ] CORS limited to frontend domain
- [ ] Rate limiting on auth endpoints
- [ ] Zod validation on all endpoints
- [ ] No stack traces in production errors
- [ ] Connection pooling configured
- [ ] Prisma migrations applied
- [ ] Seed data for demo
- [ ] Redis adapter for Socket.IO (if multi-instance)
- [ ] Code splitting + lazy loading
- [ ] Error tracking (Sentry)
- [ ] Database backups

---

## Complete API Endpoint Map

### Auth
- POST /api/auth/request-otp
- POST /api/auth/verify-otp
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me

### Academic Hierarchy (Admin)
- CRUD /api/departments
- CRUD /api/courses
- CRUD /api/divisions
- CRUD /api/batches
- CRUD /api/subjects
- CRUD /api/rooms

### Users
- GET /api/users?role=search=departmentId=
- POST /api/users
- PATCH /api/users/:id
- PATCH /api/users/:id/deactivate
- POST /api/users/bulk-promote

### Timetable
- GET /api/timetable/weekly?divisionId=weekday=
- GET /api/timetable/daily?date=divisionId=
- GET /api/timetable/teacher/:teacherId
- GET /api/timetable/student/me
- POST /api/timetable/weekly
- PATCH /api/timetable/weekly/:id
- DELETE /api/timetable/weekly/:id

### Lecture Actions
- POST /api/lectures/:id/cancel
- POST /api/lectures/:id/reschedule
- POST /api/lectures/:id/change-room
- GET /api/lectures/available-rooms?date=start=end=

### Conflicts
- POST /api/conflicts/check

### Notifications
- GET /api/notifications
- GET /api/notifications/unread-count
- PATCH /api/notifications/:id/read
- PATCH /api/notifications/read-all

### Announcements
- GET /api/announcements
- POST /api/announcements
- DELETE /api/announcements/:id

### Examinations
- GET /api/examinations?courseId=semester=
- POST /api/examinations
- PATCH /api/examinations/:id
- PATCH /api/examinations/:id/publish
- PATCH /api/examinations/:id/cancel

### Audit and Reports
- GET /api/audit/changes?date=teacherId=
- GET /api/reports/overview
- GET /api/reports/cancellations?from=to=
- GET /api/reports/room-utilization

---

## The 5 Pillars (Summary)

| Pillar | Implementation |
|:---|:---|
| **1. One Source of Truth** | Central weekly_timetable + lecture_exceptions. No duplicate data per user. |
| **2. Role-Based Access** | JWT + RBAC middleware. Student=View, Teacher=View+Own, Admin=Full. |
| **3. Auto Sync** | Socket.IO pushes every change to affected divisions instantly. |
| **4. Conflict Prevention** | 4-way check (teacher, room, division, exam) + DB-level locks. |
| **5. Traceability** | change_history: who changed what, when, from what to what. |
