const { execSync } = require('child_process');

const commands = [
  'git init',
  'git add .',
  'git commit -m "Initial commit" || echo "No changes to commit"',
  'git branch -M main',
  'git remote add origin https://github.com/vishwasmce/vishwasmce.github.io.git || git remote set-url origin https://github.com/vishwasmce/vishwasmce.github.io.git',
  'git push -u origin main'
];

console.log('🚀 Starting automatic Git push...');

for (const cmd of commands) {
  console.log(`\n> ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Failed at command: ${cmd}`);
    console.error('Please check the error message above.');
    process.exit(1);
  }
}

console.log('\n✅ Code successfully pushed to GitHub!');
