#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

(async () => {
  const cwd = process.cwd();
  const envPath = resolve(cwd, '.env');
  const examplePath = resolve(cwd, '.env.example');

  function fileExists(p) {
    try {
      return existsSync(p);
    } catch {
      return false;
    }
  }

  if (!fileExists(envPath)) {
    console.error('No .env file found in', cwd);
    process.exit(1);
  }

  const raw = readFileSync(envPath, { encoding: 'utf8' });
  const lines = raw.split(/\r?\n/);

  // helper: split a "key=value #comment" line into {key, value, comment}
  function splitAssignment(line) {
    // remove leading "export " if exists
    const exportPrefix = line.match(/^\s*export\s+/) ? line.match(/^\s*export\s+/)[0] : '';
    const withoutExport = line.replace(/^\s*export\s+/, '');
    const eqIndex = withoutExport.indexOf('=');
    if (eqIndex === -1) return null;

    const key = withoutExport.slice(0, eqIndex).trim();
    let rest = withoutExport.slice(eqIndex + 1);

    // find first unquoted # to split comment
    let commentIndex = -1;
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < rest.length; i++) {
      const ch = rest[i];
      if (ch === "'" && !inDouble) {
        inSingle = !inSingle;
      } else if (ch === '"' && !inSingle) {
        inDouble = !inDouble;
      } else if (ch === '#' && !inSingle && !inDouble) {
        commentIndex = i;
        break;
      }
    }

    let value, comment;
    if (commentIndex >= 0) {
      value = rest.slice(0, commentIndex).trim();
      comment = rest.slice(commentIndex).trimEnd();
    } else {
      value = rest.trim();
      comment = '';
    }

    return { exportPrefix, key, value, comment };
  }

  const outputLines = [];

  for (const line of lines) {
    // preserve empty lines
    if (/^\s*$/.test(line)) {
      outputLines.push('');
      continue;
    }

    // preserve full-line comments
    if (/^\s*#/.test(line)) {
      outputLines.push(line);
      continue;
    }

    // try parse assignment
    const assign = splitAssignment(line);
    if (!assign) {
      // unknown line, preserve as-is but comment it to avoid accidental secrets
      outputLines.push(`# ${line}`);
      continue;
    }

    const { key, comment } = assign;
    // set value to empty string (no quotes) but preserve inline comment if present
    const newLine = `${key}=${comment ? ' ' + comment : ''}`.trimEnd();
    outputLines.push(newLine);
  }

  const final = outputLines.join('\n') + '\n';

  try {
    writeFileSync(examplePath, final, { encoding: 'utf8' });
    console.log('.env.example has been created/updated from .env');
  } catch (err) {
    console.error('Failed to write .env.example:', err);
    process.exit(2);
  }
})();