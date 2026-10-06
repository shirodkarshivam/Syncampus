import { Request, Response } from 'express';
import { adminService } from '../services/adminService.js';

export class AdminController {
  private handleError(res: Response, err: any): void {
    console.error('Admin Controller Error:', err);
    const message = err?.message || 'An unexpected error occurred.';
    const statusCode = err?.statusCode || (message.includes('not found') ? 404 : message.includes('already exists') || message.includes('Cannot delete') ? 400 : 500);

    res.status(statusCode).json({
      error: 'ADMIN_OPERATION_ERROR',
      message,
    });
  }

  // Teachers
  async getTeachers(req: Request, res: Response): Promise<void> {
    try {
      const teachers = await adminService.getAllTeachers();
      res.status(200).json({ teachers });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async createTeacher(req: Request, res: Response): Promise<void> {
    try {
      const teacher = await adminService.createTeacher(req.body);
      res.status(201).json({ teacher, message: 'Teacher created successfully' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async deleteTeacher(req: Request, res: Response): Promise<void> {
    try {
      const result = await adminService.deleteTeacher(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Students
  async getStudents(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 500;
      const students = await adminService.getAllStudents(limit);
      res.status(200).json({ students, count: students.length });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const student = await adminService.createStudent(req.body);
      res.status(201).json({ student, message: 'Student created successfully' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const result = await adminService.deleteStudent(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Rooms / Classrooms
  async getRooms(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await adminService.getAllRooms();
      res.status(200).json({ rooms });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const room = await adminService.createRoom(req.body);
      res.status(201).json({ room, message: 'Room created successfully' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async deleteRoom(req: Request, res: Response): Promise<void> {
    try {
      const result = await adminService.deleteRoom(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Departments
  async getDepartments(req: Request, res: Response): Promise<void> {
    try {
      const departments = await adminService.getAllDepartments();
      res.status(200).json({ departments });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const department = await adminService.createDepartment(req.body);
      res.status(201).json({ department, message: 'Department created successfully' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async deleteDepartment(req: Request, res: Response): Promise<void> {
    try {
      const result = await adminService.deleteDepartment(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Divisions
  async getDivisions(req: Request, res: Response): Promise<void> {
    try {
      const divisions = await adminService.getAllDivisions();
      res.status(200).json({ divisions });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async createDivision(req: Request, res: Response): Promise<void> {
    try {
      const division = await adminService.createDivision(req.body);
      res.status(201).json({ division, message: 'Division(s) created successfully' });
    } catch (err) {
      this.handleError(res, err);
    }
  }
}

export const adminController = new AdminController();
