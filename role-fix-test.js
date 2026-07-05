/**
 * Role Fix Test Script
 * Run this in browser console to test role display fixes
 */

console.log('🚀 Starting Role Fix Test...');

// Test 1: Check current user session
const userSession = localStorage.getItem('user_session');
if (!userSession) {
    console.log('❌ No user session found. Please login first.');
} else {
    const user = JSON.parse(userSession);
    console.log('👤 Current User Session:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
    });
    
    // Test 2: Check if role is null/undefined
    if (user.role === null || user.role === undefined) {
        console.log('⚠️ Role is null/undefined - this should trigger auto-fix');
    } else {
        console.log('✅ Role is set to:', user.role);
    }
}

// Test 3: Test refresh session API
const testRefreshSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found for API test');
        return;
    }
    
    try {
        console.log('🧪 Testing refresh session API...');
        const response = await fetch('/api/companies/debug/refresh-session', {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Refresh session API response:', data);
            
            if (data.user.role) {
                console.log('✅ User role from API:', data.user.role);
                
                // Compare with localStorage
                const currentUser = JSON.parse(localStorage.getItem('user_session') || '{}');
                if (currentUser.role !== data.user.role) {
                    console.log('🔄 Role mismatch! Updating localStorage...');
                    localStorage.setItem('user_session', JSON.stringify(data.user));
                    console.log('✅ localStorage updated');
                }
            } else {
                console.log('⚠️ API still returns null role');
            }
        } else {
            console.log('❌ Refresh session API failed:', response.status);
        }
    } catch (error) {
        console.error('❌ API test error:', error);
    }
};

// Test 4: Check if auto-fix is working in the UI
const checkUIRole = () => {
    const roleElement = document.querySelector('[style*="text-transform: uppercase"][style*="#f97316"]');
    if (roleElement) {
        const roleText = roleElement.textContent?.trim();
        console.log('🎨 UI shows role as:', roleText);
        
        if (roleText === 'Loading...') {
            console.log('⏳ UI shows Loading... - auto-fix might be in progress');
        } else if (roleText && roleText !== 'buyer') {
            console.log('✅ UI shows proper role:', roleText);
        } else {
            console.log('⚠️ UI still shows generic role:', roleText);
        }
    } else {
        console.log('❓ Could not find role element in UI');
    }
};

// Run all tests
console.log('\n📋 Running All Tests...\n');

// Immediate tests
checkUIRole();

// API test
testRefreshSession().then(() => {
    console.log('\n🏁 Test Complete!\n');
    console.log('📖 If you see issues:');
    console.log('1. Try logging out and logging back in');
    console.log('2. Run the refresh session test again');
    console.log('3. Check if you are a company owner (should have manager role)');
    console.log('4. Contact support if issues persist');
});