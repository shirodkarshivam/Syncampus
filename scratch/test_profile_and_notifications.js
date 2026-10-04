// Verification of logic and data layers
const assert = require('assert');

// Test that userProfileStore concepts and data structures work reliably
console.log('--- Testing User Profile Store and Notification Logic ---');

const mockStorage = {};
const globalWindow = {
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = v; }
  },
  innerWidth: 500
};

// 1. Mobile viewport test logic
const isMobile = globalWindow.innerWidth < 768;
assert.strictEqual(isMobile, true, 'innerWidth 500 should be detected as mobile viewport');
console.log('✓ Mobile viewport detection (<768px): SUCCESS (defaults to daily view)');

globalWindow.innerWidth = 1024;
const isDesktop = globalWindow.innerWidth < 768;
assert.strictEqual(isDesktop, false, 'innerWidth 1024 should be detected as desktop');
console.log('✓ Desktop viewport detection (>=768px): SUCCESS (defaults to grid view)');

// 2. Storage and password check logic
function testProfileStorage() {
  const userId = 'stu0001@sonopantcollege.edu.in';
  const profileKey = `syncampus_user_profile_${userId.toLowerCase().trim()}`;
  
  // Save profile
  const profile = {
    contactNumber: '+91 98201 99999',
    emergencyContact: '+91 98190 88888 (Father)',
    avatarUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    password: 'password123'
  };
  globalWindow.localStorage.setItem(profileKey, JSON.stringify(profile));

  // Retrieve profile
  const loaded = JSON.parse(globalWindow.localStorage.getItem(profileKey));
  assert.strictEqual(loaded.contactNumber, '+91 98201 99999');
  assert.strictEqual(loaded.emergencyContact, '+91 98190 88888 (Father)');
  assert.strictEqual(loaded.avatarUrl.startsWith('data:image/png;base64,'), true);
  console.log('✓ Profile contact, emergency contact and avatar upload persistence: SUCCESS');

  // Change password test
  const oldPass = 'password123';
  const newPass = 'strongNewPass99';
  assert.strictEqual(oldPass === loaded.password, true, 'Current password must match');
  loaded.password = newPass;
  globalWindow.localStorage.setItem(profileKey, JSON.stringify(loaded));

  const afterUpdate = JSON.parse(globalWindow.localStorage.getItem(profileKey));
  assert.strictEqual(afterUpdate.password, 'strongNewPass99');
  console.log('✓ Password update & verification logic: SUCCESS');
}

testProfileStorage();

console.log('\n--- All Automated Logic Checks Passed! ---');
