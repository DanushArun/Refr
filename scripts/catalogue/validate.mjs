import { access, constants, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const roles = new Set(['shared', 'seeker', 'endorser']);
const referenceStatuses = new Set(['source-export-required', 'ready']);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '../..');

function addScreenErrors(errors, screen, seenIds) {
  if (!screen.id || typeof screen.id !== 'string') {
    errors.push('Screen id is required.');
  } else if (seenIds.has(screen.id)) {
    errors.push(`Duplicate screen id: ${screen.id}.`);
  } else {
    seenIds.add(screen.id);
  }

  if (!roles.has(screen.role)) {
    errors.push(`Invalid role for ${screen.id}: ${screen.role}.`);
  }

  if (!Number.isInteger(screen.sourcePanel) || screen.sourcePanel < 1 || screen.sourcePanel > 4) {
    errors.push(`Invalid source panel for ${screen.id}: ${screen.sourcePanel}.`);
  }

  if (!Array.isArray(screen.components) || screen.components.length === 0) {
    errors.push(`Visible components are required for ${screen.id}.`);
  }

  if (!referenceStatuses.has(screen.referenceStatus)) {
    errors.push(`Invalid reference status for ${screen.id}: ${screen.referenceStatus}.`);
  }
}

function buildResult(errors, screens) {
  const sourceExportRequired = screens.filter(
    (screen) => screen.referenceStatus === 'source-export-required',
  ).length;
  const status = errors.length > 0
    ? 'invalid'
    : sourceExportRequired > 0 ? 'source-export-required' : 'ready';

  return { errors, status, screenCount: screens.length, sourceExportRequired };
}

export function validateRegistry(registry) {
  const errors = [];
  const screens = Array.isArray(registry?.screens) ? registry.screens : [];

  if (!Array.isArray(registry?.screens)) {
    errors.push('Registry screens must be an array.');
  }

  if (registry?.screenCount !== screens.length) {
    errors.push('Registry screenCount does not match screens length.');
  }

  const seenIds = new Set();
  screens.forEach((screen) => addScreenErrors(errors, screen, seenIds));
  return buildResult(errors, screens);
}

function referenceDirectory(screen, referenceRoot) {
  const folder = screen.id.replace(/^(shared|seeker|endorser)-/, '');
  return join(referenceRoot, screen.role, folder);
}

export async function validateReferenceTree(screens, exists) {
  const errors = [];

  for (const screen of screens) {
    const directory = referenceDirectory(screen, 'design-reference');
    const specification = join(directory, 'specification.md');
    const audit = join(directory, 'screen-audit.md');
    const reference = join(directory, 'reference.png');

    if (!await exists(specification)) {
      errors.push(`Missing specification for ${screen.id}.`);
    }
    if (!await exists(audit)) {
      errors.push(`Missing screen audit for ${screen.id}.`);
    }
    if (screen.referenceStatus === 'ready' && !await exists(reference)) {
      errors.push(`Missing flat reference for ready screen ${screen.id}.`);
    }
  }

  return errors;
}

async function readRegistry(registryPath) {
  const content = await readFile(registryPath, 'utf8');
  return JSON.parse(content);
}

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

function resolveRegistryPath() {
  return resolve(projectRoot, 'design-reference/screen-registry.json');
}

async function main() {
  const allowSourceGate = process.argv.includes('--allow-source-gate');
  const registry = await readRegistry(resolveRegistryPath());
  const baseline = validateRegistry(registry);
  const treeErrors = await validateReferenceTree(
    registry.screens,
    (filePath) => fileExists(join(projectRoot, filePath)),
  );
  const report = buildResult([...baseline.errors, ...treeErrors], registry.screens);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

  if (report.status === 'invalid') {
    process.exitCode = 1;
  } else if (report.status === 'source-export-required' && !allowSourceGate) {
    process.exitCode = 2;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  await main();
}
