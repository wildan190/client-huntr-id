/**
 * SIMPLE Role Fix Script for Production
 * Copy-paste this entire script into browser console and press Enter
 */

console.log('🔧 Role Fix Script - v2.0');

// 1. Check current user state
const userSession = localStorage.getItem('user_session');
if (!userSession) {
    console.log('❌ Not logged in. Please login first.');
} else {
    const user = JSON.parse(userSession);
    console.log('👤 Current user:', user.name, 'Role:', user.role || 'NULL');
    
    // 2. If role is missing, fix it
    if (!user.role) {
        console.log('🔄 Role is missing, attempting fix...');
        
        // Find token in various locations
        const token = localStorage.getItem('token') || 
                     localStorage.getItem('auth_token') ||
                     user.token ||
                     (() => {
                       // Check if token is in other common locations
                       for (const key of Object.keys(localStorage)) {
                         if (key.toLowerCase().includes('token')) {
                           return localStorage.getItem(key);
                         }
                       }
                       return null;
                     })();
        
        if (!token) {
            console.log('❌ No token found. Available storage keys:', Object.keys(localStorage));
            console.log('🔄 Please logout and login again to fix the role issue');
        } else {
            fetch('/api/companies/debug/refresh-session', {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.user && data.user.role) {
                    console.log('✅ Role fixed! New role:', data.user.role);
                    localStorage.setItem('user_session', JSON.stringify(data.user));
                    console.log('🔄 Reloading page...');
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    console.log('⚠️ API call succeeded but role still null');
                    console.log('🔄 Try logging out and logging in again');
                }
            })
            .catch(error => {
                console.error('❌ Fix failed:', error);
                console.log('🔄 Try logging out and logging in again');
            });
        }
    } else {
        console.log('✅ Role is already set correctly');
    }
}

// Instructions for users
console.log(`
📋 INSTRUCTIONS:
1. If you see "Role: NULL" above, the fix will run automatically
2. If fix fails, logout and login again
3. The app works normally even without role fix - just some features may be limited
4. Role issue is cosmetic only - your account access is not affected

🔧 Manual Fix Button:
Look for a red "Fix Role" button in the sidebar user area - click it to fix manually
`);