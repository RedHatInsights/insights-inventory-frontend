import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export const CENTOS_ARCHIVE = 'centos79.tar.gz';
export const BOOTC_ARCHIVE = 'image-mode-rhel94.tar.gz';
export const EDGE_ARCHIVE = 'edge-hbi-ui-stage.tar.gz';
export const PACKAGE_BASED_ARCHIVE = 'rhel94_core_collect.tar.gz';

/**
 * Uploads an archive file to the Red Hat ingress API using `curl`.
 *
 *
 * This function constructs and executes a `curl` command via `spawnSync`
 * to upload a specified `.tar.gz` archive to the platform.
 * It requires the following environment variables:
 * - `PROXY` — proxy address used for the upload
 * - `PLAYWRIGHT_USER` — username for authentication
 * - `PLAYWRIGHT_PASSWORD` — password for authentication
 *
 * The function checks for missing credentials, validates response codes,
 * and throws descriptive errors if the upload fails or the command encounters issues.
 *
 * Jira References: https://issues.redhat.com/browse/RHINENG-21146
 *
 *  @param   {string}               archivePath - The relative path to the archive file inside `host_archives/`.
 *  @returns {{ httpCode: number }}             - The HTTP status code returned from the upload request.
 *
 * @throws {Error} If required environment variables are missing.
 * @throws {Error} If the `curl` command fails to execute.
 * @throws {Error} If the upload fails (non-201 HTTP response).
 *
 * @example
 * // Upload a sample archive file for testing
 * const result = uploadArchive('rhel94_core_collect.tar.gz');
 * console.log('Upload successful, HTTP code:', result.httpCode);
 */
export function uploadArchive(archivePath: string) {
  const fullPath = `host_archives/${archivePath}`;
  const proxy = process.env.PROXY;
  const user = process.env.PLAYWRIGHT_USER;
  const password = process.env.PLAYWRIGHT_PASSWORD;
  const uploadUrl = 'https://console.stage.redhat.com/api/ingress/v1/upload';
  const args = [
    '-x',
    `${proxy}`,
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
  const result = spawnSync('curl', args, { encoding: 'utf-8' });
  const stdout = result.stdout.trim();
  const httpCode = Number(stdout.slice(-3));
  if (!user || !password) {
    throw new Error(
      'Missing PLAYWRIGHT_USER or PLAYWRIGHT_PASSWORD environment variables.',
    );
  }
  if (result.error) {
    throw new Error(`Failed to execute curl: ${result.error.message}`);
  }
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
 *
 *
 * Workflow:
 * 1. Extracts the base archive (rhel94_core_collect.tar.gz) into a unique folder.
 * 2. Updates machine-id, subscription-manager_identity, and hostname_-f.
 * 3. Compresses the folder into a uniquely named tar.gz.
 *
 *  @param   {string}                                                        [hostArchive] The name of the base archive file located in the 'host_archives' directory.
 *  @returns {{ hostname: string, archiveName: string, workingDir: string }}               - The new hostname, archive name, and working directory path.
 * @throws {Error} If extraction or compression fails, or required files are missing.
 */
export function prepareTestArchive(hostArchive: string) {
  const baseArchive = path.join('host_archives', hostArchive);
  if (!fs.existsSync(baseArchive))
    throw new Error(`Base archive not found: ${baseArchive}`);

  // Create unique working folder
  const testId = randomUUID();
  const workingDir = path.join('host_archives', `insights-pw-vm-${testId}`);
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
  const newHostname = `insights-pw-vm-${randomUUID()}`;
  fs.writeFileSync(hostnamePath, `${newHostname}\n`);

  // ---- Compress the modified directory ----
  const archiveName = `insights-pw-vm-${testId}.tar.gz`;
  const tarFilePath = path.join('host_archives', archiveName);
  const tarResult = spawnSync(
    'tar',
    ['-czf', tarFilePath, '-C', workingDir, extractedDirs[0].name],
    { encoding: 'utf-8' },
  );
  if (tarResult.error)
    throw new Error(`Failed to create tar.gz: ${tarResult.error.message}`);

  return { hostname: newHostname, archiveName, workingDir };
}

/**
 * Deletes a specific test archive and its working folder.
 *
 *
 *  @param {string} archiveName - The archive file to delete inside host_archives.
 *  @param {string} workingDir  - The working folder to remove.
 */
export function cleanupTestArchive(archiveName: string, workingDir: string) {
  const archivePath = path.join('host_archives', archiveName);
  if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);

  if (fs.existsSync(workingDir))
    fs.rmSync(workingDir, { recursive: true, force: true });
}

/**
 *  @param             hostArchive The name of the base archive file located in the 'host_archives' directory.
 * @function prepareSingleSystem
 * @description Prepares a single test archive, uploads it, and returns the preparation result.
 *  @returns  {object}             An object containing essential setup details.
 *  @property {string} hostname    The name of the target execution system.
 *  @property {string} archiveName The name of the uploaded archive file.
 *  @property {string} workingDir  The remote directory where the archive was
 */
export function prepareSingleSystem(
  hostArchive: string = PACKAGE_BASED_ARCHIVE,
) {
  const result = prepareTestArchive(hostArchive);
  uploadArchive(result.archiveName);
  return result;
}
