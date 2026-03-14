#!/usr/bin/env node

import { access, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

const EMBEDDABLE_FORMATS = new Set(['png', 'svg', 'pdf']);
const SUPPORTED_FORMATS = new Set(['png', 'svg', 'pdf', 'jpg']);

function printHelp() {
  console.log(`Usage:
  node scripts/export-drawio.mjs <input.drawio> [options]

Options:
  -f, --format <png|svg|pdf|jpg>  Export format. Defaults to png unless inferred from --output.
  -o, --output <path>             Output path. Defaults to <input>.drawio.<format>.
      --drawio <path>            Explicit draw.io executable path.
      --open                     Open the exported file after success.
      --delete-source            Delete the source .drawio after export.
      --scale <number>           Scale factor. Defaults to 2 for png exports.
      --border <number>          Border width. Defaults to 10.
      --transparent              Use transparent background (png only, default).
      --no-transparent           Disable transparent background for png.
      --width <number>           Fit export width.
      --height <number>          Fit export height.
      --all-pages                Export all pages (pdf only).
      --page-index <number>      Export a specific page (1-based).
  -h, --help                     Show this help.

Examples:
  node scripts/export-drawio.mjs architecture.drawio --format png --open
  node scripts/export-drawio.mjs architecture.drawio --format svg
  node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf --delete-source
`);
}

function toNumber(value, flagName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value for ${flagName}: ${value}`);
  }
  return parsed;
}

function inferFormatFromPath(filePath) {
  const normalized = filePath.toLowerCase();
  const match = normalized.match(/\.drawio\.(png|svg|pdf|jpg)$/);
  if (match) {
    return match[1];
  }

  const ext = path.extname(normalized).slice(1);
  return SUPPORTED_FORMATS.has(ext) ? ext : null;
}

function buildDefaultOutput(inputPath, format) {
  return `${inputPath}.${format}`;
}

function parseArgs(argv) {
  const options = {
    border: 10,
    deleteSource: false,
    drawioPath: null,
    format: null,
    height: null,
    input: null,
    open: false,
    output: null,
    pageIndex: null,
    scale: null,
    transparent: null,
    width: null,
    allPages: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    switch (argument) {
      case '-f':
      case '--format':
        options.format = argv[++index]?.toLowerCase() ?? null;
        break;
      case '-o':
      case '--output':
        options.output = argv[++index] ?? null;
        break;
      case '--drawio':
        options.drawioPath = argv[++index] ?? null;
        break;
      case '--open':
        options.open = true;
        break;
      case '--delete-source':
        options.deleteSource = true;
        break;
      case '--scale':
        options.scale = toNumber(argv[++index], '--scale');
        break;
      case '--border':
        options.border = toNumber(argv[++index], '--border');
        break;
      case '--transparent':
        options.transparent = true;
        break;
      case '--no-transparent':
        options.transparent = false;
        break;
      case '--width':
        options.width = toNumber(argv[++index], '--width');
        break;
      case '--height':
        options.height = toNumber(argv[++index], '--height');
        break;
      case '--all-pages':
        options.allPages = true;
        break;
      case '--page-index':
        options.pageIndex = toNumber(argv[++index], '--page-index');
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
      default:
        if (argument.startsWith('-')) {
          throw new Error(`Unknown option: ${argument}`);
        }

        if (options.input) {
          throw new Error('Only one input .drawio file is supported per command.');
        }

        options.input = argument;
        break;
    }
  }

  if (options.help) {
    return options;
  }

  if (!options.input) {
    throw new Error('Missing input .drawio file.');
  }

  if (!options.input.toLowerCase().endsWith('.drawio')) {
    throw new Error(`Input must be a .drawio file: ${options.input}`);
  }

  if (!options.format && options.output) {
    options.format = inferFormatFromPath(options.output);
  }

  options.format ??= 'png';

  if (!SUPPORTED_FORMATS.has(options.format)) {
    throw new Error(`Unsupported format: ${options.format}`);
  }

  options.output ??= buildDefaultOutput(options.input, options.format);

  if (options.transparent === null) {
    options.transparent = options.format === 'png';
  }

  if (options.scale === null && options.format === 'png') {
    options.scale = 2;
  }

  if (options.deleteSource && !EMBEDDABLE_FORMATS.has(options.format)) {
    throw new Error(`--delete-source is only safe for png/svg/pdf exports with embedded XML. Format: ${options.format}`);
  }

  if (options.allPages && options.format !== 'pdf') {
    throw new Error('--all-pages is supported only for pdf exports.');
  }

  return options;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function commandCandidates() {
  const candidates = [];

  if (process.platform === 'win32') {
    const programFiles = process.env.ProgramFiles;
    const programFilesX86 = process.env['ProgramFiles(x86)'];
    const localAppData = process.env.LOCALAPPDATA;

    if (programFiles) {
      candidates.push(path.join(programFiles, 'draw.io', 'draw.io.exe'));
    }
    if (programFilesX86) {
      candidates.push(path.join(programFilesX86, 'draw.io', 'draw.io.exe'));
    }
    if (localAppData) {
      candidates.push(path.join(localAppData, 'Programs', 'draw.io', 'draw.io.exe'));
    }
  } else if (process.platform === 'darwin') {
    candidates.push('/Applications/draw.io.app/Contents/MacOS/draw.io');
  } else {
    candidates.push('drawio');
    candidates.push('draw.io');
  }

  return candidates;
}

function execForOutput(command, args) {
  return new Promise((resolve, reject) => {
    const commandSpec = normalizeCommand(command, args);
    const child = spawn(commandSpec.command, commandSpec.args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with code ${code}\n${stderr || stdout}`));
    });
  });
}

async function resolveDrawioExecutable(explicitPath) {
  if (explicitPath) {
    if (!(await fileExists(explicitPath))) {
      throw new Error(`draw.io executable not found: ${explicitPath}`);
    }
    return explicitPath;
  }

  if (process.platform === 'win32') {
    for (const candidate of ['drawio', 'draw.io', 'drawio.exe', 'draw.io.exe']) {
      try {
        const result = await execForOutput('where.exe', [candidate]);
        const resolved = result.stdout
          .split(/\r?\n/)
          .map((line) => line.trim())
          .find(Boolean);
        if (resolved) {
          return resolved;
        }
      } catch {
        // Try the next candidate.
      }
    }
  } else {
    for (const candidate of ['drawio', 'draw.io']) {
      try {
        const result = await execForOutput('which', [candidate]);
        const resolved = result.stdout.trim();
        if (resolved) {
          return resolved;
        }
      } catch {
        // Try the next candidate.
      }
    }
  }

  for (const candidate of commandCandidates()) {
    if (candidate === 'drawio' || candidate === 'draw.io') {
      return candidate;
    }
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  throw new Error('Unable to locate the draw.io CLI. Install draw.io Desktop or pass --drawio <path>.');
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const commandSpec = normalizeCommand(command, args);
    const child = spawn(commandSpec.command, commandSpec.args, {
      stdio: 'inherit',
      windowsHide: true,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function normalizeCommand(command, args) {
  if (process.platform !== 'win32') {
    return { command, args };
  }

  if (!/\.(cmd|bat)$/i.test(command)) {
    return { command, args };
  }

  return {
    command: 'cmd.exe',
    args: ['/c', command, ...args],
  };
}

async function openFile(filePath) {
  if (process.platform === 'win32') {
    await runCommand('cmd.exe', ['/c', 'start', '', filePath]);
    return;
  }

  if (process.platform === 'darwin') {
    await runCommand('open', [filePath]);
    return;
  }

  await runCommand('xdg-open', [filePath]);
}

function buildExportArgs(options) {
  const args = ['-x', '-f', options.format, '-o', options.output, '-b', String(options.border)];

  if (EMBEDDABLE_FORMATS.has(options.format)) {
    args.push('-e');
  }

  if (options.transparent && options.format === 'png') {
    args.push('-t');
  }

  if (options.scale !== null) {
    args.push('-s', String(options.scale));
  }

  if (options.width !== null) {
    args.push('--width', String(options.width));
  }

  if (options.height !== null) {
    args.push('--height', String(options.height));
  }

  if (options.allPages) {
    args.push('-a');
  }

  if (options.pageIndex !== null) {
    args.push('-p', String(options.pageIndex));
  }

  args.push(options.input);

  return args;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (!(await fileExists(options.input))) {
    throw new Error(`Input file not found: ${options.input}`);
  }

  const drawio = await resolveDrawioExecutable(options.drawioPath);
  const args = buildExportArgs(options);

  console.log(`[export-drawio] draw.io executable: ${drawio}`);
  console.log(`[export-drawio] exporting ${options.input} -> ${options.output} (${options.format})`);

  await runCommand(drawio, args);

  if (!(await fileExists(options.output))) {
    throw new Error(`Export completed but output file is missing: ${options.output}`);
  }

  if (options.deleteSource) {
    await rm(options.input);
    console.log(`[export-drawio] deleted source file: ${options.input}`);
  }

  if (options.open) {
    await openFile(options.output);
  }

  console.log('[export-drawio] done');
}

main().catch((error) => {
  console.error(`[export-drawio] ${error.message}`);
  process.exitCode = 1;
});
