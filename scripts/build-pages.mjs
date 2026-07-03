import { execSync } from 'node:child_process';

const raw = process.env.PREVIEW_BASE_PATH || process.env.BASE_PATH || '/cms-exercise-archive-2026/';
const base = raw.endsWith('/') ? raw : `${raw}/`;

execSync('npm run build', {
  stdio: 'inherit',
  env: { ...process.env, BASE_PATH: base },
});

console.log(`Built with BASE_PATH=${base}`);
