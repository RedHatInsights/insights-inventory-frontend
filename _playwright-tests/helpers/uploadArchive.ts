import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { PACKAGE_BASED_ARCHIVE, DEFAULT_PREFIX } from './constants';
import { recordToManifest } from './cleanup';

export interface System {
  hostname: string;
}

export interface ModifiedArchive {
  hostname: string;
  archiveName: string;
}

/**
 * Uploads a .tar.gz archive to the Red Hat Ingress API via curl.
 * Requires: PROXY, PLAYWRIGHT_USER, and PLAYWRIGHT_PASSWORD env vars.
 *
 * Jira References: https://issues.redhat.com/browse/RHINENG-21146
 *
 *  @param   {string}                        archivePath - Relative path to the archive in host_archives/.
 *  @returns {Promise<{ httpCode: number }>}             Object containing the HTTP response code.
 * @throws {Error} Missing credentials, curl failure, or non-201 response.
 */
export async function uploadArchive(archivePath: string) {
  const fullPath = `host_archives/${archivePath}`;
  const proxy = process.env.PROXY;
  const user = process.env.PLAYWRIGHT_USER;
  const password =
    process.env.PROD === 'true'
      ? process.env.PROD_PLAYWRIGHT_PASSWORD
      : process.env.PLAYWRIGHT_PASSWORD;

  const uploadUrl =
    process.env.PROD === 'true'
      ? 'https://console.redhat.com/api/ingress/v1/upload'
      : 'https://console.stage.redhat.com/api/ingress/v1/upload';

  if (!user || !password) {
    throw new Error(
      'Missing PLAYWRIGHT_USER or PLAYWRIGHT_PASSWORD environment variables.',
    );
  }

  const args = [
    '--retry',
    '3',
    '--retry-delay',
    '5',
    '--retry-all-errors',
    '-s',
    '-o',
    '/tmp/upload_output.txt',
    '-w',
    '%{http_code}',
    '-F',
    `upload=@${fullPath};type=application/vnd.redhat.advisor.collection+tgz`,
    uploadUrl,
    '-u',
    `${user}:${password}`,
  ];

  if (proxy && proxy !== 'undefined') args.unshift('-x', proxy);

  const result = spawnSync('curl', args, { encoding: 'utf-8' });

  if (result.error) throw new Error(`Curl failed: ${result.error.message}`);
  const stdout = result.stdout.trim();
  const httpCode = Number(stdout.slice(-3));

  if (httpCode !== 201) {
    const stderrMsg = result.stderr?.toString().trim() || 'Unknown error';
    throw new Error(
      `Upload failed with HTTP code ${httpCode}. stderr: ${stderrMsg}`,
    );
  }
  return { httpCode };
}

/**
 * Prepares a test-specific copy of the base archive, modifies its files, and compresses it for upload.
 * Updates: machine-id, subscription-manager identity, and hostname.
 *  @param   {string}          baseArchiveName - Base filename to clone .
 *  @param   {string}          prefix          - String to prepend to the new hostname/filename.
 *  @returns {ModifiedArchive}                 - The new hostname, archive name
 * @throws {Error} If extraction or compression fails, or required files are missing.
 */
export function prepareTestArchive(
  baseArchiveName: string,
  prefix: string = DEFAULT_PREFIX,
): ModifiedArchive {
  const baseArchive = path.join('host_archives', baseArchiveName);
  if (!fs.existsSync(baseArchive))
    throw new Error(`Base archive not found: ${baseArchive}`);

  // Create unique working folder
  const testId = randomUUID();
  const workingDir = path.join('host_archives', `${prefix}-${testId}`);
  fs.mkdirSync(workingDir);

  // Extract base archive into the unique folder
  const extractResult = spawnSync(
    'tar',
    ['-xzf', baseArchive, '-C', workingDir],
    { encoding: 'utf-8' },
  );
  if (extractResult.error)
    throw new Error(
      `Failed to extract base archive: ${extractResult.error.message}`,
    );

  // Determine extracted directory (assuming only one top-level folder)
  const extractedDirs = fs
    .readdirSync(workingDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());
  if (extractedDirs.length !== 1)
    throw new Error(`Unexpected extracted contents in ${workingDir}`);
  const baseDir = path.join(workingDir, extractedDirs[0].name);

  // ---- Update machine-id ----
  const machineIdPath = path.join(
    baseDir,
    'data/etc/insights-client/machine-id',
  );
  if (!fs.existsSync(machineIdPath))
    throw new Error(`File not found: ${machineIdPath}`);
  fs.writeFileSync(machineIdPath, `${randomUUID()}\n`);

  // ---- Update subscription-manager_identity ----
  const subMgrPath = path.join(
    baseDir,
    'data/insights_commands/subscription-manager_identity',
  );
  if (!fs.existsSync(subMgrPath))
    throw new Error(`File not found: ${subMgrPath}`);
  const subMgrLines = fs.readFileSync(subMgrPath, 'utf-8').split('\n');
  const newSubMgrId = randomUUID();
  const updatedSubMgr = subMgrLines.map((line) =>
    line.startsWith('system identity:')
      ? `system identity: ${newSubMgrId}`
      : line,
  );
  fs.writeFileSync(subMgrPath, updatedSubMgr.join('\n'));

  // ---- Update hostname ----
  const hostnamePath = path.join(baseDir, 'data/insights_commands/hostname_-f');
  if (!fs.existsSync(hostnamePath))
    throw new Error(`File not found: ${hostnamePath}`);

  const newHostname = `${prefix}-${randomUUID()}`;
  fs.writeFileSync(hostnamePath, `${newHostname}\n`);

  // ---- Compress the modified directory ----
  const archiveName = `${prefix}-${testId}.tar.gz`;
  const tarFilePath = path.join('host_archives', archiveName);
  const tarResult = spawnSync(
    'tar',
    ['-czf', tarFilePath, '-C', workingDir, extractedDirs[0].name],
    { encoding: 'utf-8' },
  );
  if (tarResult.error)
    throw new Error(`Failed to create tar.gz: ${tarResult.error.message}`);

  recordToManifest({ archiveName, workingDir });

  return { hostname: newHostname, archiveName };
}

/**
 * Initializes and uploads a single host archive.
 */
export async function createSystem(
  baseArchiveName: string = PACKAGE_BASED_ARCHIVE,
  prefix: string = DEFAULT_PREFIX,
): Promise<System> {
  const system = prepareTestArchive(baseArchiveName, prefix);
  await uploadArchive(system.archiveName);

  return {
    hostname: system.hostname,
  };
}

/**
 * Sequential uploads of multiple test systems.
 */
export async function setupMultipleSystems(
  baseArchiveName: string[],
  prefix: string = DEFAULT_PREFIX,
): Promise<System[]> {
  const fleet = [];

  for (const archive of baseArchiveName) {
    const system = await createSystem(archive, prefix);
    fleet.push(system);
  }
  return fleet;
}
