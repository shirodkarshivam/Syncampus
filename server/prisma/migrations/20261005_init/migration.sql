-- SyncCampus Initial PostgreSQL Migration

-- Create Enums
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');
CREATE TYPE "RoomType" AS ENUM ('CLASSROOM', 'LAB', 'SEMINAR_HALL');
CREATE TYPE "LectureStatus" AS ENUM ('SCHEDULED', 'RESCHEDULED', 'CANCELLED', 'ROOM_CHANGED', 'SUBSTITUTE');
CREATE TYPE "NotificationType" AS ENUM ('CANCELLATION', 'RESCHEDULE', 'ROOM_CHANGE', 'TEACHER_CHANGE', 'ANNOUNCEMENT');

-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "password_hash" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: departments
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: courses
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "duration_years" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: rooms
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "room_code" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "room_type" "RoomType" NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 60,
    "building" TEXT,
    "floor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable: divisions
CREATE TABLE "divisions" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "division_name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "assigned_room_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: teachers
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "specialization" TEXT,
    "cabin" TEXT,
    "contact_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: students
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "division_id" TEXT NOT NULL,
    "roll_number" TEXT,
    "classroom" TEXT,
    "practical_batch" TEXT,
    "contact_number" TEXT,
    "emergency_contact" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable: subjects
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "academic_year" TEXT,
    "is_practical" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable: teacher_subjects
CREATE TABLE "teacher_subjects" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable: lectures
CREATE TABLE "lectures" (
    "id" TEXT NOT NULL,
    "division_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "day_name" TEXT NOT NULL,
    "period_number" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "status" "LectureStatus" NOT NULL DEFAULT 'SCHEDULED',
    "original_teacher_id" TEXT,
    "original_room_id" TEXT,
    "original_start_time" TEXT,
    "original_end_time" TEXT,
    "original_day" TEXT,
    "cancellation_reason" TEXT,
    "effective_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable: notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_user_id" TEXT,
    "division_id" TEXT,
    "lecture_id" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable: timetable_changes
CREATE TABLE "timetable_changes" (
    "id" TEXT NOT NULL,
    "lecture_id" TEXT NOT NULL,
    "changed_by_user_id" TEXT,
    "change_type" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timetable_changes_pkey" PRIMARY KEY ("id")
);

-- Create Unique Indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_identifier_key" ON "users"("identifier");

CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

CREATE UNIQUE INDEX "rooms_room_code_key" ON "rooms"("room_code");

CREATE UNIQUE INDEX "divisions_full_name_key" ON "divisions"("full_name");
CREATE UNIQUE INDEX "divisions_course_id_academic_year_division_name_key" ON "divisions"("course_id", "academic_year", "division_name");

CREATE UNIQUE INDEX "teachers_user_id_key" ON "teachers"("user_id");
CREATE UNIQUE INDEX "teachers_teacher_id_key" ON "teachers"("teacher_id");
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers"("email");

CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");
CREATE UNIQUE INDEX "students_student_id_key" ON "students"("student_id");
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

CREATE UNIQUE INDEX "subjects_course_id_code_name_key" ON "subjects"("course_id", "code", "name");

CREATE UNIQUE INDEX "teacher_subjects_teacher_id_subject_id_key" ON "teacher_subjects"("teacher_id", "subject_id");

-- Create Performance Indexes
CREATE INDEX "courses_department_id_idx" ON "courses"("department_id");
CREATE INDEX "divisions_course_id_idx" ON "divisions"("course_id");
CREATE INDEX "teachers_department_id_idx" ON "teachers"("department_id");
CREATE INDEX "students_division_id_idx" ON "students"("division_id");
CREATE INDEX "subjects_course_id_idx" ON "subjects"("course_id");
CREATE INDEX "teacher_subjects_teacher_id_idx" ON "teacher_subjects"("teacher_id");
CREATE INDEX "teacher_subjects_subject_id_idx" ON "teacher_subjects"("subject_id");

CREATE INDEX "lectures_division_id_idx" ON "lectures"("division_id");
CREATE INDEX "lectures_teacher_id_idx" ON "lectures"("teacher_id");
CREATE INDEX "lectures_room_id_idx" ON "lectures"("room_id");
CREATE INDEX "lectures_day_of_week_period_number_idx" ON "lectures"("day_of_week", "period_number");

CREATE INDEX "notifications_recipient_user_id_idx" ON "notifications"("recipient_user_id");
CREATE INDEX "notifications_division_id_idx" ON "notifications"("division_id");
CREATE INDEX "timetable_changes_lecture_id_idx" ON "timetable_changes"("lecture_id");

-- Add Foreign Key Constraints
ALTER TABLE "courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "divisions" ADD CONSTRAINT "divisions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_assigned_room_id_fkey" FOREIGN KEY ("assigned_room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "students" ADD CONSTRAINT "students_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subjects" ADD CONSTRAINT "subjects_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lectures" ADD CONSTRAINT "lectures_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_original_teacher_id_fkey" FOREIGN KEY ("original_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_original_room_id_fkey" FOREIGN KEY ("original_room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "lectures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "timetable_changes" ADD CONSTRAINT "timetable_changes_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "lectures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "timetable_changes" ADD CONSTRAINT "timetable_changes_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
