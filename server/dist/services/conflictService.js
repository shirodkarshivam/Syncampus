export const PERIOD_TIME_MAP = {
    1: { startTime: '09:00', endTime: '10:00', timeString: '09:00 - 10:00' },
    2: { startTime: '10:00', endTime: '11:00', timeString: '10:00 - 11:00' },
    3: { startTime: '11:00', endTime: '12:00', timeString: '11:00 - 12:00' },
    4: { startTime: '01:00', endTime: '02:00', timeString: '01:00 - 02:00' },
    5: { startTime: '02:00', endTime: '03:00', timeString: '02:00 - 03:00' },
};
export const DAY_NUMBER_MAP = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
};
export class ConflictService {
    /**
     * Checks if the specified teacher is already occupied during the target day and period.
     * Cancelled lectures do NOT produce conflicts.
     */
    checkTeacherConflict(lectures, teacherId, dayOfWeek, periodNumber, excludeLectureId) {
        const conflicting = lectures.find(l => l.id !== excludeLectureId &&
            l.teacherId === teacherId &&
            l.dayOfWeek === dayOfWeek &&
            l.periodNumber === periodNumber &&
            l.status.toUpperCase() !== 'CANCELLED');
        if (conflicting) {
            const timeStr = PERIOD_TIME_MAP[periodNumber]?.timeString || `Period ${periodNumber}`;
            const dayStr = DAY_NUMBER_MAP[dayOfWeek] || `Day ${dayOfWeek}`;
            return {
                type: 'TEACHER_CONFLICT',
                message: `Teacher ${teacherId} already has a scheduled lecture on ${dayStr} during ${timeStr}.`,
                details: {
                    field: 'teacherId',
                    value: teacherId,
                    dayOfWeek,
                    periodNumber,
                    conflictingLectureId: conflicting.id,
                    conflictingSubject: conflicting.subjectName,
                    timeSlot: timeStr,
                },
            };
        }
        return null;
    }
    /**
     * Checks if the specified room is already occupied during the target day and period.
     * Cancelled lectures do NOT produce conflicts.
     */
    checkRoomConflict(lectures, roomId, dayOfWeek, periodNumber, excludeLectureId) {
        const conflicting = lectures.find(l => l.id !== excludeLectureId &&
            (l.roomId === roomId || l.roomName === roomId) &&
            l.dayOfWeek === dayOfWeek &&
            l.periodNumber === periodNumber &&
            l.status.toUpperCase() !== 'CANCELLED');
        if (conflicting) {
            const timeStr = PERIOD_TIME_MAP[periodNumber]?.timeString || `Period ${periodNumber}`;
            const dayStr = DAY_NUMBER_MAP[dayOfWeek] || `Day ${dayOfWeek}`;
            return {
                type: 'ROOM_CONFLICT',
                message: `Room ${roomId} is already occupied on ${dayStr} during ${timeStr}.`,
                details: {
                    field: 'roomId',
                    value: roomId,
                    dayOfWeek,
                    periodNumber,
                    conflictingLectureId: conflicting.id,
                    conflictingSubject: conflicting.subjectName,
                    timeSlot: timeStr,
                },
            };
        }
        return null;
    }
    /**
     * Checks if the specified division already has a lecture scheduled during the target day and period.
     * Cancelled lectures do NOT produce conflicts.
     */
    checkDivisionConflict(lectures, divisionId, dayOfWeek, periodNumber, excludeLectureId) {
        const conflicting = lectures.find(l => l.id !== excludeLectureId &&
            (l.divisionId === divisionId || l.divisionName === divisionId) &&
            l.dayOfWeek === dayOfWeek &&
            l.periodNumber === periodNumber &&
            l.status.toUpperCase() !== 'CANCELLED');
        if (conflicting) {
            const timeStr = PERIOD_TIME_MAP[periodNumber]?.timeString || `Period ${periodNumber}`;
            const dayStr = DAY_NUMBER_MAP[dayOfWeek] || `Day ${dayOfWeek}`;
            return {
                type: 'DIVISION_CONFLICT',
                message: `Division ${divisionId} already has a scheduled lecture on ${dayStr} during ${timeStr}.`,
                details: {
                    field: 'divisionId',
                    value: divisionId,
                    dayOfWeek,
                    periodNumber,
                    conflictingLectureId: conflicting.id,
                    conflictingSubject: conflicting.subjectName,
                    timeSlot: timeStr,
                },
            };
        }
        return null;
    }
    /**
     * Evaluates all three constraints (Teacher, Room, Division) and returns all detected conflicts.
     */
    checkAllConflicts(params) {
        const conflicts = [];
        const teacherConflict = this.checkTeacherConflict(params.lectures, params.teacherId, params.dayOfWeek, params.periodNumber, params.excludeLectureId);
        if (teacherConflict)
            conflicts.push(teacherConflict);
        const roomConflict = this.checkRoomConflict(params.lectures, params.roomId, params.dayOfWeek, params.periodNumber, params.excludeLectureId);
        if (roomConflict)
            conflicts.push(roomConflict);
        const divisionConflict = this.checkDivisionConflict(params.lectures, params.divisionId, params.dayOfWeek, params.periodNumber, params.excludeLectureId);
        if (divisionConflict)
            conflicts.push(divisionConflict);
        return {
            hasConflict: conflicts.length > 0,
            conflicts,
        };
    }
}
export const conflictService = new ConflictService();
