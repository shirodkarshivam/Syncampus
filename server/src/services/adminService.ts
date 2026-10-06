import { prisma, isDbConfigured } from '../config/database.js';
import { UserRole, RoomType } from '@prisma/client';
import { hashPassword } from '../utils/password.js';

export interface CreateTeacherInput {
  id: string; // e.g. T073
  name: string;
  department: string;
  subjects: string[];
  email: string;
  room?: string;
  status?: string;
}

export interface CreateStudentInput {
  id: string; // e.g. STU2701
  name: string;
  department: string;
  course: string;
  year: string; // FY, SY, TY
  division: string; // A, B, C, D
  classroom?: string;
  batch?: string;
  email: string;
  status?: string;
}

export interface CreateRoomInput {
  name: string;
  code?: string;
  capacity?: number;
  floor?: string;
  type?: string; // Classroom | Computer Lab | Auditorium
  status?: string;
}

export interface CreateDepartmentInput {
  name: string;
  code: string;
}

export interface CreateDivisionInput {
  course: string;
  year: string;
  divisionNames: string;
}

export class AdminService {
  // ==========================================
  // 1. TEACHER CRUD
  // ==========================================

  async getAllTeachers() {
    if (!isDbConfigured) return [];

    const teachers = await prisma.teacher.findMany({
      include: {
        department: true,
        subjects: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { teacherId: 'asc' },
    });

    return teachers.map((t) => ({
      id: t.teacherId,
      name: t.fullName,
      title: t.fullName.startsWith('Prof.') ? t.fullName : `Prof. ${t.fullName}`,
      department: t.department?.name || 'Science & Technology',
      departmentCode: t.department?.code || 'SCI_TECH',
      subjects: t.subjects.map((s) => s.subject.name),
      email: t.email,
      room: t.cabin || `Faculty Cabin ${t.teacherId}`,
      status: 'Active' as const,
    }));
  }

  async createTeacher(input: CreateTeacherInput) {
    const defaultPasswordHash = await hashPassword('password123');

    // 1. Find or match department
    let department = await prisma.department.findFirst({
      where: {
        OR: [
          { name: { equals: input.department, mode: 'insensitive' } },
          { code: { equals: input.department, mode: 'insensitive' } },
        ],
      },
    });

    if (!department) {
      department = await prisma.department.findFirst();
      if (!department) throw new Error('No departments exist in system.');
    }

    // 2. Create User & Teacher inside transaction
    return await prisma.$transaction(async (tx) => {
      // Check if user or teacher with identifier/email already exists
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [{ email: input.email }, { identifier: input.id }],
        },
      });

      if (existingUser) {
        throw new Error(`Teacher with ID ${input.id} or email ${input.email} already exists.`);
      }

      const user = await tx.user.create({
        data: {
          email: input.email,
          identifier: input.id,
          role: UserRole.TEACHER,
          passwordHash: defaultPasswordHash,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          teacherId: input.id,
          fullName: input.name,
          email: input.email,
          departmentId: department.id,
          cabin: input.room || `Faculty Cabin ${input.id}`,
        },
      });

      // 3. Connect subjects if any
      if (input.subjects && input.subjects.length > 0) {
        for (const subName of input.subjects) {
          let subject = await tx.subject.findFirst({
            where: { name: { equals: subName.trim(), mode: 'insensitive' } },
          });

          if (!subject) {
            subject = await tx.subject.findFirst({
              where: { name: { contains: subName.trim(), mode: 'insensitive' } },
            });
          }

          if (!subject) {
            const course = await tx.course.findFirst({
              where: { departmentId: department.id },
            });
            if (course) {
              const code = `SUB-${Date.now().toString().slice(-4)}`;
              subject = await tx.subject.create({
                data: {
                  code,
                  name: subName.trim(),
                  courseId: course.id,
                  academicYear: 'FY',
                },
              });
            }
          }

          if (subject) {
            await tx.teacherSubject.upsert({
              where: {
                teacherId_subjectId: {
                  teacherId: teacher.id,
                  subjectId: subject.id,
                },
              },
              create: {
                teacherId: teacher.id,
                subjectId: subject.id,
              },
              update: {},
            });
          }
        }
      }

      return {
        id: teacher.teacherId,
        name: teacher.fullName,
        title: teacher.fullName.startsWith('Prof.') ? teacher.fullName : `Prof. ${teacher.fullName}`,
        department: department.name,
        departmentCode: department.code,
        subjects: input.subjects || [],
        email: teacher.email,
        room: teacher.cabin,
        status: 'Active',
      };
    });
  }

  async deleteTeacher(teacherId: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { teacherId },
      include: {
        lectures: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
    });

    if (!teacher) {
      throw new Error(`Teacher with ID ${teacherId} not found.`);
    }

    if (teacher.lectures.length > 0) {
      throw new Error(
        `Cannot remove faculty member ${teacher.fullName} (${teacherId}): They are currently assigned to ${teacher.lectures.length} active lecture(s). Reassign or cancel these lectures first.`
      );
    }

    return await prisma.$transaction(async (tx) => {
      await tx.teacherSubject.deleteMany({ where: { teacherId: teacher.id } });
      await tx.teacher.delete({ where: { id: teacher.id } });
      await tx.user.delete({ where: { id: teacher.userId } });
      return { success: true, message: `Teacher ${teacher.fullName} deleted successfully.` };
    });
  }

  // ==========================================
  // 2. STUDENT CRUD
  // ==========================================

  async getAllStudents(limit?: number) {
    if (!isDbConfigured) return [];

    const students = await prisma.student.findMany({
      take: limit || undefined,
      include: {
        division: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
      },
      orderBy: { studentId: 'asc' },
    });

    return students.map((s) => ({
      id: s.studentId,
      name: s.fullName,
      department: s.division?.course?.department?.name || 'Science & Technology',
      course: s.division?.course?.name || 'BSc IT',
      year: s.division?.academicYear || 'FY',
      division: s.division?.divisionName || 'A',
      classroom: s.classroom || 'Room 101',
      batch: s.practicalBatch || 'A',
      email: s.email,
      status: 'Enrolled' as const,
    }));
  }

  async createStudent(input: CreateStudentInput) {
    const defaultPasswordHash = await hashPassword('password123');

    // 1. Resolve target division
    const divName = (input.division || 'A').toUpperCase();
    const yr = (input.year || 'FY').toUpperCase();
    const crsName = input.course.trim();

    let division = await prisma.division.findFirst({
      where: {
        academicYear: yr,
        divisionName: divName,
        course: {
          OR: [
            { name: { equals: crsName, mode: 'insensitive' } },
            { code: { equals: crsName, mode: 'insensitive' } },
          ],
        },
      },
      include: { course: { include: { department: true } } },
    });

    if (!division) {
      division = await prisma.division.findFirst({
        include: { course: { include: { department: true } } },
      });
      if (!division) throw new Error('No academic divisions exist in system.');
    }

    // 2. Create User & Student
    return await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [{ email: input.email }, { identifier: input.id }],
        },
      });

      if (existingUser) {
        throw new Error(`Student with ID ${input.id} or email ${input.email} already exists.`);
      }

      const user = await tx.user.create({
        data: {
          email: input.email,
          identifier: input.id,
          role: UserRole.STUDENT,
          passwordHash: defaultPasswordHash,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentId: input.id,
          fullName: input.name,
          email: input.email,
          divisionId: division.id,
          classroom: input.classroom || division.fullName,
          practicalBatch: input.batch || 'A',
        },
      });

      return {
        id: student.studentId,
        name: student.fullName,
        department: division.course.department.name,
        course: division.course.name,
        year: division.academicYear,
        division: division.divisionName,
        classroom: student.classroom,
        batch: student.practicalBatch,
        email: student.email,
        status: 'Enrolled',
      };
    });
  }

  async deleteStudent(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (!student) {
      throw new Error(`Student with ID ${studentId} not found.`);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.student.delete({ where: { id: student.id } });
      await tx.user.delete({ where: { id: student.userId } });
      return { success: true, message: `Student ${student.fullName} withdrawn successfully.` };
    });
  }

  // ==========================================
  // 3. CLASSROOM / SPACE CRUD
  // ==========================================

  async getAllRooms() {
    if (!isDbConfigured) return [];

    const rooms = await prisma.room.findMany({
      orderBy: { roomCode: 'asc' },
    });

    return rooms.map((r) => ({
      id: r.roomCode,
      name: r.roomName,
      capacity: r.capacity,
      floor: r.floor || 'Floor 1',
      type: (r.roomType === RoomType.LAB
        ? 'Computer Lab'
        : r.roomType === RoomType.SEMINAR_HALL
        ? 'Auditorium'
        : 'Classroom') as any,
      status: 'Available' as const,
      code: r.roomCode,
    }));
  }

  async createRoom(input: CreateRoomInput) {
    const code = input.code || input.name;
    const existing = await prisma.room.findUnique({
      where: { roomCode: code },
    });

    if (existing) {
      throw new Error(`Room with code "${code}" already exists.`);
    }

    let roomType: RoomType = RoomType.CLASSROOM;
    if (input.type === 'Computer Lab') roomType = RoomType.LAB;
    if (input.type === 'Auditorium') roomType = RoomType.SEMINAR_HALL;

    const room = await prisma.room.create({
      data: {
        roomCode: code,
        roomName: input.name,
        roomType,
        capacity: Number(input.capacity) || 60,
        floor: input.floor || 'Floor 1',
      },
    });

    return {
      id: room.roomCode,
      name: room.roomName,
      capacity: room.capacity,
      floor: room.floor,
      type: input.type || 'Classroom',
      status: 'Available',
      code: room.roomCode,
    };
  }

  async deleteRoom(roomCode: string) {
    const room = await prisma.room.findUnique({
      where: { roomCode },
      include: {
        lectures: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
    });

    if (!room) {
      throw new Error(`Space with code "${roomCode}" not found.`);
    }

    if (room.lectures.length > 0) {
      throw new Error(
        `Cannot remove space "${room.roomName}": It is currently assigned to ${room.lectures.length} active scheduled lecture(s). Reassign them first.`
      );
    }

    await prisma.room.delete({ where: { id: room.id } });
    return { success: true, message: `Space "${room.roomName}" decommissioned successfully.` };
  }

  // ==========================================
  // 4. DEPARTMENT CRUD
  // ==========================================

  async getAllDepartments() {
    if (!isDbConfigured) return [];

    const depts = await prisma.department.findMany({
      include: {
        courses: {
          include: {
            divisions: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return depts.map((d) => {
      const allDivisionsCount = d.courses.reduce((acc, c) => acc + c.divisions.length, 0);
      return {
        id: d.id,
        name: d.name,
        code: d.code,
        coursesCount: d.courses.length,
        divisionsCount: allDivisionsCount,
        description: `Academic Department for ${d.name}`,
        courses: d.courses.map((c) => c.name),
      };
    });
  }

  async createDepartment(input: CreateDepartmentInput) {
    const existing = await prisma.department.findFirst({
      where: {
        OR: [{ code: input.code }, { name: input.name }],
      },
    });

    if (existing) {
      throw new Error(`Department with code ${input.code} or name ${input.name} already exists.`);
    }

    const dept = await prisma.department.create({
      data: {
        code: input.code.toUpperCase().replace(/\s+/g, '_'),
        name: input.name,
      },
    });

    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      coursesCount: 0,
      divisionsCount: 0,
      description: `Academic Department for ${dept.name}`,
      courses: [],
    };
  }

  async deleteDepartment(id: string) {
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { courses: true },
    });

    if (!dept) {
      throw new Error(`Department not found.`);
    }

    if (dept.courses.length > 0) {
      throw new Error(
        `Cannot remove department "${dept.name}": It has ${dept.courses.length} active courses. Remove or transfer courses first.`
      );
    }

    await prisma.department.delete({ where: { id } });
    return { success: true, message: `Department "${dept.name}" removed.` };
  }

  // ==========================================
  // 5. DIVISION CRUD
  // ==========================================

  async getAllDivisions() {
    if (!isDbConfigured) return [];

    const divisions = await prisma.division.findMany({
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    // Group by course + academicYear
    const groups = new Map<string, any>();
    let counter = 1;

    for (const d of divisions) {
      const key = `${d.course.name}_${d.academicYear}`;
      if (!groups.has(key)) {
        groups.set(key, {
          no: counter++,
          department: d.course.department.name,
          departmentCode: d.course.department.code,
          course: d.course.name,
          courseCode: d.course.code,
          year: d.academicYear,
          divisions: [d.divisionName],
          divisionNames: `Div ${d.divisionName}`,
          divisionCount: 1,
        });
      } else {
        const item = groups.get(key);
        item.divisions.push(d.divisionName);
        item.divisionNames = item.divisions.map((n: string) => `Div ${n}`).join(', ');
        item.divisionCount = item.divisions.length;
      }
    }

    return Array.from(groups.values());
  }

  async createDivision(input: CreateDivisionInput) {
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { name: { equals: input.course.trim(), mode: 'insensitive' } },
          { code: { equals: input.course.trim(), mode: 'insensitive' } },
        ],
      },
      include: { department: true },
    });

    if (!course) {
      throw new Error(`Course "${input.course}" not found.`);
    }

    const yr = input.year.toUpperCase();
    const divNames = input.divisionNames
      .split(',')
      .map((d) => d.replace(/div/i, '').trim().toUpperCase())
      .filter(Boolean);

    for (const dName of divNames) {
      const fullName = `${course.name}-${yr}-${dName}`;
      await prisma.division.upsert({
        where: {
          courseId_academicYear_divisionName: {
            courseId: course.id,
            academicYear: yr,
            divisionName: dName,
          },
        },
        create: {
          courseId: course.id,
          academicYear: yr,
          divisionName: dName,
          fullName,
        },
        update: {},
      });
    }

    return {
      department: course.department.name,
      departmentCode: course.department.code,
      course: course.name,
      courseCode: course.code,
      year: yr,
      divisions: divNames,
      divisionNames: divNames.map((n) => `Div ${n}`).join(', '),
      divisionCount: divNames.length,
    };
  }
}

export const adminService = new AdminService();
