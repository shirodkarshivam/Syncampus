export function validateLoginInput(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body must be a valid JSON object' };
    }
    const { identifier, password } = body;
    if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
        return { isValid: false, error: 'Identifier (ID or email) is required' };
    }
    if (identifier.trim().length > 100) {
        return { isValid: false, error: 'Identifier exceeds maximum allowed length' };
    }
    if (!password || typeof password !== 'string' || password.length === 0) {
        return { isValid: false, error: 'Password is required' };
    }
    if (password.length > 256) {
        return { isValid: false, error: 'Password exceeds maximum allowed length' };
    }
    return { isValid: true };
}
export function validateChangePasswordInput(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body must be a valid JSON object' };
    }
    const { currentPassword, newPassword } = body;
    if (!currentPassword || typeof currentPassword !== 'string' || currentPassword.length === 0) {
        return { isValid: false, error: 'Current password is required' };
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length === 0) {
        return { isValid: false, error: 'New password is required' };
    }
    if (newPassword.length < 8) {
        return { isValid: false, error: 'New password must be at least 8 characters long' };
    }
    if (newPassword.length > 128) {
        return { isValid: false, error: 'New password exceeds maximum length of 128 characters' };
    }
    return { isValid: true };
}
export function validateRefreshTokenInput(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body must be a valid JSON object' };
    }
    const { refreshToken } = body;
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
        return { isValid: false, error: 'Refresh token is required' };
    }
    return { isValid: true };
}
