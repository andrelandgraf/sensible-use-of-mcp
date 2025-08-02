// Simple test script to verify API endpoints work with API key authentication
// Usage: node test-api.js <API_KEY>

const apiKey = process.argv[2];
if (!apiKey) {
  console.error("Usage: node test-api.js <API_KEY>");
  process.exit(1);
}

const API_BASE_URL = "http://localhost:3000/api";

async function testApiEndpoint(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    console.log(`Testing ${options.method || 'GET'} ${endpoint}...`);
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`Response:`, JSON.stringify(data, null, 2));
    console.log('---');
    return data;
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error.message);
    console.log('---');
  }
}

async function runTests() {
  console.log("Testing Support Case API with API Key Authentication");
  console.log("=================================================");
  
  // Test 1: Get all support cases
  await testApiEndpoint("/support-cases");
  
  // Test 2: Get messages for first case (if any exist)
  // Note: In a real test, you'd want to use an actual case ID
  // await testApiEndpoint("/support-cases/some-case-id/messages");
  
  console.log("Test completed. Check that:");
  console.log("1. API returns 401 if API key is invalid");
  console.log("2. API returns 401 if API key doesn't belong to admin");
  console.log("3. API returns data if API key is valid admin key");
}

runTests();