const fs = require('fs');
const path = require('path');

// We will inspect the exact counts and integrity of the datasets
console.log('=== RUNNING REPOSITORY AUDIT INSPECTOR ===\n');

// 1. Inspect studentsData.ts
const studentsDataContent = fs.readFileSync(path.join(__dirname, '../client/src/data/studentsData.ts'), 'utf8');
const studentMatches = studentsDataContent.match(/id:\s*['"](STU\d+)['"]/g) || [];
console.log('STUDENTS:');
console.log('  Count in studentsData.ts:', studentMatches.length);

// 2. Inspect Student_data.txt
const studentTxtContent = fs.readFileSync(path.join(__dirname, '../dataFake/Student_data.txt'), 'utf8');
const studentTxtLines = studentTxtContent.split('\n').filter(l => l.trim().length > 0);
console.log('  Lines in Student_data.txt:', studentTxtLines.length);

// 3. Inspect teachersData.ts
const teachersDataContent = fs.readFileSync(path.join(__dirname, '../client/src/data/teachersData.ts'), 'utf8');
const teacherMatches = teachersDataContent.match(/id:\s*['"](T\d+)['"]/g) || [];
console.log('\nTEACHERS:');
console.log('  Count in teachersData.ts:', teacherMatches.length);

// 4. Inspect college.txt
const collegeTxt = fs.readFileSync(path.join(__dirname, '../dataFake/college.txt'), 'utf8');

// 5. Inspect mockData.ts rooms
const mockDataContent = fs.readFileSync(path.join(__dirname, '../client/src/data/mockData.ts'), 'utf8');
const roomMatches = mockDataContent.match(/"code":\s*"ROOM-\d+"/g) || [];
const labMatches = mockDataContent.match(/"code":\s*"LAB-\d+"/g) || [];
const hallMatches = mockDataContent.match(/"code":\s*"HALL-\d+"/g) || [];
console.log('\nROOMS in mockData.ts:');
console.log('  Classrooms:', roomMatches.length);
console.log('  Labs:', labMatches.length);
console.log('  Halls:', hallMatches.length);
console.log('  Total spaces:', roomMatches.length + labMatches.length + hallMatches.length);

// 6. Inspect timetableData.ts
const timetableDataContent = fs.readFileSync(path.join(__dirname, '../client/src/data/timetableData.ts'), 'utf8');
const lectureMatches = timetableDataContent.match(/id:\s*['"]lec-[^'"]+['"]/g) || [];
console.log('\nTIMETABLE in timetableData.ts:');
console.log('  Total lectures defined:', lectureMatches.length);

// 7. Check departments and courses in curriculumData.ts
const curriculumContent = fs.readFileSync(path.join(__dirname, '../client/src/data/curriculumData.ts'), 'utf8');
console.log('  Curriculum file length bytes:', curriculumContent.length);

// 8. Check test files in scratch
const scratchFiles = fs.readdirSync(path.join(__dirname, '../scratch'));
console.log('\nSCRATCH SCRIPTS & TESTS:');
scratchFiles.forEach(f => console.log('  -', f));
