import { spawn } from 'child_process';
import fs from 'fs';

const creds = JSON.parse(fs.readFileSync('../google-credentials.json', 'utf8'));

function setSecret(name, value) {
  return new Promise((resolve, reject) => {
    const child = spawn('npx.cmd', ['wrangler', 'secret', 'put', name], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    child.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Enter a secret value')) {
        child.stdin.write(value + '\n');
        child.stdin.end();
      }
    });

    child.stderr.on('data', (data) => console.error(data.toString()));

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`Successfully set ${name}`);
        resolve();
      } else {
        reject(new Error(`Failed to set ${name}`));
      }
    });
  });
}

async function run() {
  try {
    await setSecret('GOOGLE_CLIENT_EMAIL', creds.client_email);
    await setSecret('GOOGLE_PRIVATE_KEY', creds.private_key);
    console.log("All secrets pushed successfully!");
  } catch(e) {
    console.error(e);
  }
}
run();
