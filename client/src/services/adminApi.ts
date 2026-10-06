import { fetchWithAuth } from './authApi';
import type { Classroom, DepartmentSummary, AcademicDivisionEntry } from '../data/mockData';
import type { TeacherProfile } from '../data/teachersData';
import type { Student } from '../data/studentsData';

export const adminApi = {
  // Teachers
  async getTeachers(): Promise<TeacherProfile[]> {
    const res = await fetchWithAuth('/api/v1/admin/teachers');
    if (!res.ok) throw new Error('Failed to fetch teachers');
    const data = await res.json();
    return data.teachers || [];
  },

  async createTeacher(teacher: {
    id: string;
    name: string;
    department: string;
    subjects: string[];
    email: string;
    room?: string;
    status?: string;
  }): Promise<TeacherProfile> {
    const res = await fetchWithAuth('/api/v1/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(teacher),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to register teacher');
    }
    return data.teacher;
  },

  async deleteTeacher(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetchWithAuth(`/api/v1/admin/teachers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete teacher');
    }
    return data;
  },

  // Students
  async getStudents(limit: number = 500): Promise<Student[]> {
    const res = await fetchWithAuth(`/api/v1/admin/students?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch students');
    const data = await res.json();
    return data.students || [];
  },

  async createStudent(student: {
    id: string;
    name: string;
    department: string;
    course: string;
    year: string;
    division: string;
    classroom?: string;
    batch?: string;
    email: string;
    status?: string;
  }): Promise<Student> {
    const res = await fetchWithAuth('/api/v1/admin/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to enroll student');
    }
    return data.student;
  },

  async deleteStudent(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetchWithAuth(`/api/v1/admin/students/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to withdraw student');
    }
    return data;
  },

  // Rooms / Classrooms
  async getRooms(): Promise<Classroom[]> {
    const res = await fetchWithAuth('/api/v1/admin/rooms');
    if (!res.ok) throw new Error('Failed to fetch rooms');
    const data = await res.json();
    return data.rooms || [];
  },

  async createRoom(room: {
    name: string;
    code?: string;
    capacity?: number;
    floor?: string;
    type?: string;
    status?: string;
  }): Promise<Classroom> {
    const res = await fetchWithAuth('/api/v1/admin/rooms', {
      method: 'POST',
      body: JSON.stringify(room),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create room');
    }
    return data.room;
  },

  async deleteRoom(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetchWithAuth(`/api/v1/admin/rooms/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to decommission room');
    }
    return data;
  },

  // Departments
  async getDepartments(): Promise<DepartmentSummary[]> {
    const res = await fetchWithAuth('/api/v1/admin/departments');
    if (!res.ok) throw new Error('Failed to fetch departments');
    const data = await res.json();
    return data.departments || [];
  },

  async createDepartment(department: { name: string; code: string }): Promise<DepartmentSummary> {
    const res = await fetchWithAuth('/api/v1/admin/departments', {
      method: 'POST',
      body: JSON.stringify(department),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create department');
    }
    return data.department;
  },

  async deleteDepartment(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetchWithAuth(`/api/v1/admin/departments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete department');
    }
    return data;
  },

  // Divisions
  async getDivisions(): Promise<AcademicDivisionEntry[]> {
    const res = await fetchWithAuth('/api/v1/admin/divisions');
    if (!res.ok) throw new Error('Failed to fetch divisions');
    const data = await res.json();
    return data.divisions || [];
  },

  async createDivision(div: { course: string; year: string; divisionNames: string }): Promise<AcademicDivisionEntry> {
    const res = await fetchWithAuth('/api/v1/admin/divisions', {
      method: 'POST',
      body: JSON.stringify(div),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create division');
    }
    return data.division;
  },
};
