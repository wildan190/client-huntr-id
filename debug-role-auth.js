/**
 * Debug Role Update Authorization
 * Run this in browser console when you get "Forbidden" error trying to update team roles
 */

console.log('🔍 Debugging Role Update Authorization...');

// Get current user and company info
const userSession = localStorage.getItem('user_session');
const companySession = localStorage.getItem('active_company');

if (!userSession || !companySession) {
    console.log('❌ Missing session data');
    console.log('User session:', userSession ? 'EXISTS' : 'MISSING');
    console.log('Company session:', companySession ? 'EXISTS' : 'MISSING');
} else {
    const user = JSON.parse(userSession);
    const company = JSON.parse(companySession);
    
    console.log('👤 Current User:', {
        id: user.id,
        name: user.name,
        role: user.role,
        company_id: user.company_id
    });
    
    console.log('🏢 Active Company:', {
        id: company.id,
        name: company.name,
        owner_id: company.owner_id,
        type: company.type
    });
    
    // Check authorization conditions
    const companyMatches = user.company_id === company.id;
    const isOwner = company.owner_id === user.id;
    const hasManagerRole = user.role === 'manager';
    
    console.log('🔐 Authorization Check:');
    console.log('- Company ID matches:', companyMatches);
    console.log('- Is company owner:', isOwner);
    console.log('- Has manager role:', hasManagerRole);
    console.log('- Can update roles:', (hasManagerRole || isOwner) && companyMatches);
    
    if (!companyMatches) {
        console.log('❌ ISSUE FOUND: User company_id does not match active company');
        console.log(`User belongs to company: ${user.company_id}`);
        console.log(`Trying to manage company: ${company.id}`);
    }
    
    if (!hasManagerRole && !isOwner) {
        console.log('❌ ISSUE FOUND: User is not manager and not company owner');
        console.log(`Current role: ${user.role}`);
        console.log(`Company owner: ${company.owner_id}`);
        console.log(`User ID: ${user.id}`);
    }
    
    // Test API endpoint
    const token = localStorage.getItem('token') || user.token;
    if (token) {
        console.log('🧪 Testing debug authorization endpoint...');
        
        fetch(`/api/companies/debug/${company.id}/debug-role-update-auth`, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('📋 Server Authorization Check:', data);
            
            if (data.authorization_check && !data.authorization_check.can_update_roles) {
                console.log('❌ SERVER CONFIRMS: User cannot update roles');
                
                if (!data.authorization_check.company_matches) {
                    console.log('💡 SOLUTION: Fix company assignment');
                    console.log('Run this fix:');
                    console.log(`User needs to be assigned to company ${company.id}`);
                }
                
                if (!data.authorization_check.has_manager_role && !data.authorization_check.is_company_owner) {
                    console.log('💡 SOLUTION: Fix role assignment');
                    console.log('User needs manager role or to be company owner');
                }
            } else {
                console.log('✅ SERVER SAYS: User should be able to update roles');
                console.log('The issue might be in frontend or a race condition');
            }
        })
        .catch(error => {
            console.error('❌ Debug API failed:', error);
        });
    } else {
        console.log('❌ No token found for API test');
    }
}

console.log('\n📋 Next Steps:');
console.log('1. Check the authorization results above');
console.log('2. If company_id mismatch: user needs to be assigned to correct company');
console.log('3. If role issue: user needs manager role or company ownership');
console.log('4. If server says OK but still forbidden: check frontend request');
console.log('\n💡 Quick fixes:');
console.log('- Run role fix: use "Fix Role" button in sidebar');
console.log('- Switch company: use "Switch Company" if you have multiple companies');
console.log('- Logout/login: refresh all session data');