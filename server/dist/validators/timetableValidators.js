export function validateCancelInput(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body must be a valid JSON object' };
    }
    if (!body.reason || typeof body.reason !== 'string' || body.reason.trim().length === 0) {
        return { isValid: false, error: 'A valid cancellation reason is required' };
    }
    if (body.reason.trim().length < 3) {
        return { isValid: false, error: 'Cancellation reason must be at least 3 characters long' };
    }
    return { isValid: true };
}
export function validateRescheduleInput(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body must be a valid JSON object' };
    }
    // dayOfWeek: 1 (Mon) to 5 (Fri) or day name string
    let dayOfWeek = body.dayOfWeek;
    if (typeof dayOfWeek === 'string') {
        const dayMap = {
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
        };
        dayOfWeek = dayMap[dayOfWeek.toLowerCase()];
    }
    if (typeof dayOfWeek !== 'number' || dayOfWeek < 1 || dayOfWeek > 5) {
        return { isValid: false, error: 'dayOfWeek must be between 1 (Monday) and 5 (Friday)' };
    }
    // periodNumber: 1 to 5
    const periodNumber = Number(body.periodNumber);
    if (isNaN(periodNumber) || periodNumber < 1 || periodNumber > 5) {
        return { isValid: false, error: 'periodNumber must be an integer between 1 and 5' };
    }
    if (!body.reason || typeof body.reason !== 'string' || body.reason.trim().length < 3) {
        return { isValid: false, error: 'A valid reason of at least 3 characters is required' };
    }
    return { isValid: true };
}
export function validateChangeRoomInput(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body must be a valid JSON object' };
    }
    if (!body.roomId || typeof body.roomId !== 'string' || body.roomId.trim().length === 0) {
        return { isValid: false, error: 'Target roomId is required' };
    }
    if (body.reason && (typeof body.reason !== 'string' || body.reason.trim().length < 3)) {
        return { isValid: false, error: 'If provided, reason must be at least 3 characters long' };
    }
    return { isValid: true };
}
export function validateChangeTeacherInput(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body must be a valid JSON object' };
    }
    if (!body.teacherId || typeof body.teacherId !== 'string' || body.teacherId.trim().length === 0) {
        return { isValid: false, error: 'Substitute teacherId is required' };
    }
    if (body.reason && (typeof body.reason !== 'string' || body.reason.trim().length < 3)) {
        return { isValid: false, error: 'If provided, reason must be at least 3 characters long' };
    }
    return { isValid: true };
}
export function validateExtraLectureInput(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body must be a valid JSON object' };
    }
    const { subjectId, divisionId, teacherId, roomId, dayOfWeek, periodNumber } = body;
    if (!subjectId || typeof subjectId !== 'string')
        return { isValid: false, error: 'subjectId is required' };
    if (!divisionId || typeof divisionId !== 'string')
        return { isValid: false, error: 'divisionId is required' };
    if (!teacherId || typeof teacherId !== 'string')
        return { isValid: false, error: 'teacherId is required' };
    if (!roomId || typeof roomId !== 'string')
        return { isValid: false, error: 'roomId is required' };
    if (typeof dayOfWeek !== 'number' || dayOfWeek < 1 || dayOfWeek > 5) {
        return { isValid: false, error: 'dayOfWeek must be between 1 (Monday) and 5 (Friday)' };
    }
    if (typeof periodNumber !== 'number' || periodNumber < 1 || periodNumber > 5) {
        return { isValid: false, error: 'periodNumber must be between 1 and 5' };
    }
    return { isValid: true };
}
