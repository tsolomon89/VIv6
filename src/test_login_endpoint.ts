
async function run() {
    try {
        console.log('Testing /api/health...');
        const health = await fetch('http://localhost:11306/api/health');
        console.log('Health:', health.status, await health.json());

        console.log('Testing /api/auth/login...');
        const login = await fetch('http://localhost:11306/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test_admin@victory.com', password: 'password123' })
        });
        
        console.log('Login Status:', login.status);
        if (login.ok) {
            const data = await login.json();
            console.log('Login Success! Token:', data.token ? 'YES' : 'NO');
        } else {
            console.log('Login Failed:', await login.text());
        }
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}
run();
