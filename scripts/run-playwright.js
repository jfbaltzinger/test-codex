#!/usr/bin/env node
const { spawn } = require('child_process');
const { existsSync, readdirSync } = require('fs');
const { join } = require('path');

const isWindows = process.platform === 'win32';
const npmExec = isWindows ? 'npx.cmd' : 'npx';

function run(command, args) {
  return new Promise(resolve => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false });
    child.on('close', code => resolve(code));
  });
}

function hasChromiumCache() {
  const cacheDir = join(__dirname, '..', 'node_modules', '.cache', 'ms-playwright');
  if (!existsSync(cacheDir)) {
    return false;
  }

  try {
    return readdirSync(cacheDir).some(entry => entry.startsWith('chromium-'));
  } catch (error) {
    console.warn('Could not inspect Playwright cache directory:', error.message);
    return false;
  }
}

(async () => {
  const installCode = await run(npmExec, ['playwright', 'install', 'chromium']);

  if (installCode !== 0 && !hasChromiumCache()) {
    console.warn('\n⚠️  Skipping Playwright tests: unable to download Chromium and no cached browser is available.');
    process.exit(0);
  }

  if (installCode !== 0) {
    console.warn('\nContinuing with existing cached Playwright browsers.');
  }

  const testCode = await run(npmExec, ['playwright', 'test']);
  process.exit(testCode);
})();
