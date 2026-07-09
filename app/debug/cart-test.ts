/**
 * Debug utilities for testing cart vs PR item count issue
 * Temporary debugging utilities - remove in production
 */

export async function testInputVarsLimit(itemCount: number = 15) {
  console.log(`=== Testing PHP input vars limit with ${itemCount} items ===`);
  
  // Generate test data
  const formData = new FormData();
  formData.append('company_id', 'test-company-id');
  formData.append('user_id', 'test-user-id');
  formData.append('title', 'Test PR for Input Vars');
  formData.append('description', 'Testing input variables limit');
  formData.append('duration_days', '7');
  formData.append('status', 'pending_approval');
  formData.append('delivery_point', 'Test delivery location');
  
  // Add test items
  for (let i = 0; i < itemCount; i++) {
    formData.append(`items[${i}][catalogue_id]`, `test-catalogue-${i}`);
    formData.append(`items[${i}][qty]`, '1');
    formData.append(`items[${i}][estimated_price]`, '100000');
    formData.append(`items[${i}][expected_date]`, '2026-07-16');
  }
  
  try {
    const response = await fetch('/api/debug/test-input-vars', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log('Test Input Vars Result:', result);
    
    return result;
  } catch (error) {
    console.error('Test Input Vars Error:', error);
    throw error;
  }
}

export async function testFormDataParsing(itemCount: number = 15) {
  console.log(`=== Testing FormData parsing with ${itemCount} items ===`);
  
  const formData = new FormData();
  
  // Add test items
  for (let i = 0; i < itemCount; i++) {
    formData.append(`items[${i}][catalogue_id]`, `test-catalogue-${i}`);
    formData.append(`items[${i}][qty]`, '1');
    formData.append(`items[${i}][estimated_price]`, '100000');
    formData.append(`items[${i}][expected_date]`, '2026-07-16');
  }
  
  // Count FormData entries
  let entryCount = 0;
  for (let [key, value] of formData.entries()) {
    entryCount++;
    if (entryCount <= 10) {
      console.log(`FormData entry ${entryCount}: ${key} = ${value}`);
    }
  }
  console.log(`Total FormData entries: ${entryCount}`);
  
  try {
    const response = await fetch('/api/debug/test-formdata', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log('Test FormData Result:', result);
    
    return result;
  } catch (error) {
    console.error('Test FormData Error:', error);
    throw error;
  }
}

// Helper function to run all tests
export async function runCartDebugging(itemCount: number = 15) {
  console.log(`🔍 Starting cart debugging with ${itemCount} items`);
  
  try {
    console.log('\n--- Test 1: PHP Input Variables Limit ---');
    const inputVarsResult = await testInputVarsLimit(itemCount);
    
    console.log('\n--- Test 2: FormData Parsing ---');
    const formDataResult = await testFormDataParsing(itemCount);
    
    console.log('\n--- Summary ---');
    console.log(`PHP max_input_vars: ${inputVarsResult.php_max_input_vars}`);
    console.log(`Total request keys: ${inputVarsResult.total_request_keys}`);
    console.log(`Items received by PHP: ${inputVarsResult.items_received}`);
    console.log(`Items extracted by parser: ${formDataResult.extracted_items_count}`);
    
    if (inputVarsResult.items_received < itemCount) {
      console.warn(`⚠️  FOUND ISSUE: Only ${inputVarsResult.items_received} out of ${itemCount} items were received!`);
      console.warn('This suggests a PHP max_input_vars limit issue.');
      console.warn(`Current max_input_vars: ${inputVarsResult.php_max_input_vars}`);
      console.warn('Recommendation: Increase max_input_vars in php.ini or use different data structure.');
    } else {
      console.log('✅ All items were received correctly');
    }
    
  } catch (error) {
    console.error('Debugging failed:', error);
  }
}

// Make it available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).cartDebug = {
    testInputVarsLimit,
    testFormDataParsing,
    runCartDebugging,
  };
  
  console.log('🔧 Cart debugging utilities loaded. Use cartDebug.runCartDebugging(15) to test.');
}