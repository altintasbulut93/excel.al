
const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'altintasbulut93';
const REPO = 'excel.al';
const BRANCH = 'main';

async function githubRequest(method, url, data = null) {
    const options = {
        method,
        hostname: 'api.github.com',
        path: url,
        headers: {
            'User-Agent': 'NodeJS-Uploader',
            'Authorization': `token ${TOKEN}`,
            'Content-Type': 'application/json',
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(body ? JSON.parse(body) : null);
                } else {
                    reject(new Error(`GitHub API Error: ${res.statusCode} ${body}`));
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function uploadFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    const content = fs.readFileSync(fullPath, 'base64');
    const apiUrl = `/repos/${OWNER}/${REPO}/contents/${filePath}`;
    let sha = null;
    try {
        const existing = await githubRequest('GET', apiUrl);
        if (existing) sha = existing.sha;
    } catch (e) { }

    await githubRequest('PUT', apiUrl, {
        message: `Deploy fix: Pinning versions and finalize globals.css for Tailwind 4.`,
        content,
        branch: BRANCH,
        sha
    });
    console.log(`Uploaded: ${filePath}`);
}

async function main() {
    await uploadFile('package.json');
    await uploadFile('app/globals.css');
    console.log('--- DONE ---');
}

main().catch(console.error);
