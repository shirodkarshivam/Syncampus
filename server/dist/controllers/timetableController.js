import { timetableService, TimetableError } from '../services/timetableService.js';
import { validateCancelInput, validateRescheduleInput, validateChangeRoomInput, validateChangeTeacherInput, validateExtraLectureInput, } from '../validators/timetableValidators.js';
export class TimetableController {
    handleError(res, err) {
        if (err instanceof TimetableError) {
            res.status(err.statusCode).json({
                error: err.errorCode,
                message: err.message,
                details: err.details,
            });
            return;
        }
        console.error('Unhandled Timetable Error:', err);
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected internal error occurred.',
        });
    }
    /**
     * GET /api/v1/timetable/lectures/:lectureId
     */
    async getLecture(req, res) {
        try {
            const lecture = await timetableService.getLectureById(req.params.lectureId);
            res.status(200).json({ lecture });
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * GET /api/v1/students/me/timetable
     */
    async getStudentTimetable(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        try {
            const timetable = await timetableService.getStudentTimetable(req.user);
            res.status(200).json({
                count: timetable.length,
                division: req.user.student?.divisionId,
                timetable,
            });
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * GET /api/v1/teachers/me/timetable
     */
    async getTeacherTimetable(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        try {
            const requestedTeacherId = req.query.teacherId;
            const timetable = await timetableService.getTeacherTimetable(req.user, requestedTeacherId);
            res.status(200).json({
                count: timetable.length,
                teacherId: requestedTeacherId || req.user.teacher?.teacherId || req.user.identifier,
                timetable,
            });
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * GET /api/v1/divisions/:divisionId/timetable
     */
    async getDivisionTimetable(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        try {
            const timetable = await timetableService.getDivisionTimetable(req.user, req.params.divisionId);
            res.status(200).json({
                divisionId: req.params.divisionId,
                count: timetable.length,
                timetable,
            });
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * GET /api/v1/rooms/:roomId/timetable
     */
    async getRoomTimetable(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        try {
            const timetable = await timetableService.getRoomTimetable(req.user, req.params.roomId);
            res.status(200).json({
                roomId: req.params.roomId,
                count: timetable.length,
                timetable,
            });
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * GET /api/v1/admin/timetable
     */
    async getMasterTimetable(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        try {
            const timetable = await timetableService.getMasterTimetable(req.user, req.query);
            res.status(200).json({
                total: timetable.length,
                filters: req.query,
                timetable,
            });
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * POST /api/v1/timetable/lectures/:lectureId/cancel
     */
    async cancelLecture(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        const validation = validateCancelInput(req.body);
        if (!validation.isValid) {
            res.status(400).json({ error: 'BAD_REQUEST', message: validation.error });
            return;
        }
        try {
            const result = await timetableService.cancelLecture(req.params.lectureId, req.user, req.body.reason);
            res.status(200).json(result);
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * POST /api/v1/timetable/lectures/:lectureId/reschedule
     */
    async rescheduleLecture(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        const validation = validateRescheduleInput(req.body);
        if (!validation.isValid) {
            res.status(400).json({ error: 'BAD_REQUEST', message: validation.error });
            return;
        }
        try {
            const result = await timetableService.rescheduleLecture(req.params.lectureId, req.user, req.body);
            res.status(200).json(result);
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * POST /api/v1/timetable/lectures/:lectureId/change-room
     */
    async changeRoom(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        const validation = validateChangeRoomInput(req.body);
        if (!validation.isValid) {
            res.status(400).json({ error: 'BAD_REQUEST', message: validation.error });
            return;
        }
        try {
            const result = await timetableService.changeRoom(req.params.lectureId, req.user, req.body);
            res.status(200).json(result);
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * POST /api/v1/timetable/lectures/:lectureId/change-teacher
     */
    async changeTeacher(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        const validation = validateChangeTeacherInput(req.body);
        if (!validation.isValid) {
            res.status(400).json({ error: 'BAD_REQUEST', message: validation.error });
            return;
        }
        try {
            const result = await timetableService.changeTeacher(req.params.lectureId, req.user, req.body);
            res.status(200).json(result);
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * POST /api/v1/timetable/lectures/extra
     */
    async createExtraLecture(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        const validation = validateExtraLectureInput(req.body);
        if (!validation.isValid) {
            res.status(400).json({ error: 'BAD_REQUEST', message: validation.error });
            return;
        }
        try {
            const result = await timetableService.createExtraLecture(req.user, req.body);
            res.status(201).json(result);
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * DELETE /api/v1/timetable/lectures/:lectureId
     */
    async deleteLecture(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
            return;
        }
        try {
            const result = await timetableService.deleteLecture(req.params.lectureId, req.user);
            res.status(200).json(result);
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
    /**
     * GET /api/v1/timetable/lectures/:lectureId/history
     */
    async getHistory(req, res) {
        try {
            const lecture = await timetableService.getLectureById(req.params.lectureId);
            res.status(200).json({
                lectureId: req.params.lectureId,
                history: lecture.history || [],
            });
        }
        catch (err) {
            this.handleError(res, err);
        }
    }
}
export const timetableController = new TimetableController();
