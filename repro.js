const http = require('http');
const querystring = require('querystring');

function postRequest(path, data, cookies = []) {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'Cookie': cookies.join('; ')
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

function getRequest(path, cookies = []) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Cookie': cookies.join('; ')
            }
        };
        const req = http.get(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });
        req.on('error', reject);
    });
}


async function run() {
    const username = 'testuser' + Date.now() + '@example.com';
    const password = 'password123';

    console.log(`Registering user: ${username}`);

    try {
        // 1. Register
        // Note: Form uses username for email
        const regRes = await postRequest('/register', {
            username: username,
            password: password
        });

        console.log(`Register Status: ${regRes.statusCode}`);
        console.log(`Register Location: ${regRes.headers.location}`);

        let cookies = [];
        if (regRes.headers['set-cookie']) {
            cookies = regRes.headers['set-cookie'];
        }

        // 2. Login
        console.log('\nLogging in...');
        // Login form sends 'username' and 'password'
        const loginRes = await postRequest('/login', {
            username: username,
            password: password
        }, cookies); // Pass cookie/session if persisted, but likely we want new login

        console.log(`Login Status: ${loginRes.statusCode}`);
        console.log(`Login Location: ${loginRes.headers.location}`);

        if (loginRes.headers['set-cookie']) {
            cookies = loginRes.headers['set-cookie'];
        }

        // 3. Access Protected Route
        // Check if we are really logged in by hitting /submit
        const accessRes = await getRequest('/submit', cookies);
        console.log(`Access /submit Status: ${accessRes.statusCode}`);
        if (accessRes.statusCode === 200) {
            if (accessRes.body.includes('submit')) { // basic check if rendered
                console.log('Access /submit success (content check passed likely)');
            } else {
                console.log('Access /submit might have failed content check');
            }
        } else if (accessRes.statusCode === 302) {
            console.log(`Redirected to: ${accessRes.headers.location}`);
        }

    } catch (err) {
        console.error(err);
    }
}

run();
