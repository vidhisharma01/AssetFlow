const email = 'admin@assetflow.com';
const password = 'password123';

const formData = new URLSearchParams();
formData.append('username', email); // OAuth2 requires 'username'
formData.append('password', password);

async function testLogin() {
    console.log(`Attempting to log in as: ${email}`);
    try {
        const response = await fetch('http://localhost:8000/api/v1/identity/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Login failed');
        }

        const data = await response.json();
        console.log("✅ SUCCESS! Login form returned valid token.");
        console.log(`Access Token: ${data.access_token.substring(0, 30)}...`);
        console.log(`Logged in User: ${data.user.first_name} ${data.user.last_name}`);
    } catch (err) {
        console.error("❌ FAILED:", err.message);
    }
}

testLogin();
