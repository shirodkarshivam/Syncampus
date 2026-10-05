import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Paths to authoritative raw datasets
const collegeTxtPath = path.resolve(__dirname, '../../../dataFake/college.txt');
const studentTxtPath = path.resolve(__dirname, '../../../dataFake/Student_data.txt');
let cachedTeachers = null;
let cachedStudents = null;
function loadFallbackTeachers() {
    if (cachedTeachers)
        return cachedTeachers;
    cachedTeachers = [];
    try {
        if (fs.existsSync(collegeTxtPath)) {
            const content = fs.readFileSync(collegeTxtPath, 'utf8');
            const lines = content.split('\n');
            let inTeacherTable = false;
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Teacher ID')) {
                    inTeacherTable = true;
                    continue;
                }
                if (inTeacherTable) {
                    const parts = trimmed.split('\t');
                    if (parts[0]?.startsWith('T')) {
                        const teacherId = parts[0].trim();
                        const name = parts[1]?.trim() || '';
                        const dept = parts[2]?.trim() || '';
                        const email = `${teacherId.toLowerCase()}@syncampus.ac.in`;
                        cachedTeachers.push({
                            id: `teach-${teacherId}`,
                            identifier: teacherId,
                            name,
                            department: dept,
                            email: email.toLowerCase(),
                            role: 'TEACHER',
                        });
                    }
                }
            }
        }
    }
    catch (err) {
        console.warn('Could not parse college.txt for fallback auth:', err);
    }
    return cachedTeachers;
}
export function loadFallbackStudents() {
    if (cachedStudents)
        return cachedStudents;
    cachedStudents = [];
    try {
        if (fs.existsSync(studentTxtPath)) {
            const content = fs.readFileSync(studentTxtPath, 'utf8');
            const lines = content.split('\n');
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i]?.trim();
                if (!line)
                    continue;
                const parts = line.split('\t');
                // Student ID, Name, Email, Division, Course, Year, Roll, Classroom, Practical Batch, Phone, Emergency
                if (parts.length >= 8 && parts[0]?.startsWith('STU')) {
                    const studentId = parts[0];
                    const name = parts[1] || '';
                    const department = parts[2] || '';
                    const course = parts[3] || '';
                    const year = parts[4] || '';
                    const division = parts[5] || '';
                    const email = (parts[8] || `${studentId.toLowerCase()}@sonopantcollege.edu.in`).trim();
                    cachedStudents.push({
                        id: `stu-${studentId}`,
                        identifier: studentId,
                        name,
                        email: email.toLowerCase(),
                        department,
                        division: `${course}_${year}_${division}`,
                        role: 'STUDENT',
                    });
                }
            }
        }
    }
    catch (err) {
        console.warn('Could not parse Student_data.txt for fallback auth:', err);
    }
    return cachedStudents;
}
export function findFallbackUser(identifier, requestedRole) {
    const clean = identifier.trim();
    const lower = clean.toLowerCase();
    // Special multi-role developer user access for Shivam Shirodkar
    if (lower === 'shirodkarshivam068@gmail.com' ||
        clean === 'admin-user-SHIVAM' ||
        clean === 'teach-user-SHIVAM' ||
        clean === 'stu-user-SHIVAM' ||
        clean === 'ADMIN-SHIVAM' ||
        clean === 'T-SHIVAM' ||
        clean === 'STU-SHIVAM') {
        const rolePref = requestedRole?.toUpperCase() ||
            (clean.includes('teach') || clean.includes('T-')
                ? 'TEACHER'
                : clean.includes('stu') || clean.includes('STU-')
                    ? 'STUDENT'
                    : 'ADMIN');
        if (rolePref === 'TEACHER') {
            return {
                id: 'teach-user-SHIVAM',
                identifier: 'T-SHIVAM',
                email: 'shirodkarshivam068@gmail.com',
                name: 'Prof. Shivam Shirodkar',
                department: 'Science & Technology',
                role: 'TEACHER',
            };
        }
        if (rolePref === 'STUDENT') {
            return {
                id: 'stu-user-SHIVAM',
                identifier: 'STU-SHIVAM',
                email: 'shirodkarshivam068@gmail.com',
                name: 'Shivam Shirodkar',
                department: 'Science & Technology',
                division: 'BSc IT_FY_A',
                role: 'STUDENT',
            };
        }
        return {
            id: 'admin-user-SHIVAM',
            identifier: 'ADMIN-SHIVAM',
            email: 'shirodkarshivam068@gmail.com',
            name: 'Shivam Shirodkar (Admin)',
            role: 'ADMIN',
        };
    }
    if (lower === 'admin@syncampus.ac.in' || clean === 'ADMIN01') {
        return {
            id: 'admin-user-001',
            identifier: 'ADMIN01',
            email: 'admin@syncampus.ac.in',
            name: 'System Administrator',
            role: 'ADMIN',
        };
    }
    const emailPrefix = lower.split('@')[0];
    const teachers = loadFallbackTeachers();
    const teacher = teachers.find(t => t.identifier === clean || t.email === lower || t.identifier.toLowerCase() === emailPrefix);
    if (teacher)
        return teacher;
    const students = loadFallbackStudents();
    const student = students.find(s => s.identifier === clean || s.email === lower || s.identifier.toLowerCase() === emailPrefix);
    if (student)
        return student;
    return null;
}
