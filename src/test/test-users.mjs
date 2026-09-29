export async function testAPI() {
    try {
        console.log('🧪 Testing API endpoint...');
        const response = await fetch('http://localhost:3000/api/users');

        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} - ${response.statusText}`);
            const errorText = await response.text();
            console.error('Error body:', errorText);
            return;
        }

        const data = await response.json();
        console.log('✅ API call successful!');
        console.log(`📊 Found ${data.length} users`);

        if (data.length > 0) {
            console.log('📝 First user:', JSON.stringify(data[0], null, 2));
        }
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

testAPI();