const { execSync } = require('child_process');
const fs = require('fs');

const creds = JSON.parse(fs.readFileSync('../google-credentials.json', 'utf8'));

// Format secret so it survives the echo mechanism
const email = creds.client_email;
const key = creds.private_key;

// Escape newlines for windows echo
// Actually, setting private key with newlines via echo is almost impossible in cmd.
// So let's write to a temporary file and pipe it using cmd '<'
fs.writeFileSync('temp_email.txt', email);
fs.writeFileSync('temp_key.txt', key);

try {
  console.log('Setting GOOGLE_CLIENT_EMAIL...');
  execSync('npx wrangler secret put GOOGLE_CLIENT_EMAIL < temp_email.txt', { stdio: 'inherit', shell: 'cmd.exe' });

  console.log('Setting GOOGLE_PRIVATE_KEY...');
  execSync('npx wrangler secret put GOOGLE_PRIVATE_KEY < temp_key.txt', { stdio: 'inherit', shell: 'cmd.exe' });

  console.log('SUCCESS!');
} catch (e) {
  console.error('Failed', e.message);
} finally {
  fs.unlinkSync('temp_email.txt');
  fs.unlinkSync('temp_key.txt');
}
