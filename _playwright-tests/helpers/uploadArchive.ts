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

let cachedAccessToken: string | null = null;

/**
 * Exchanges an offline (refresh) token for a short-lived access token via SSO.
 * Caches the result for the lifetime of the process to avoid repeated exchanges.
 */
function getAccessToken(): string {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  const offlineToken =
    process.env.PROD === 'true'
      ? process.env.PROD_OFFLINE_TOKEN
      : process.env.STAGE_OFFLINE_TOKEN;
  const proxy = process.env.PROXY;

  const tokenEnvName =
    process.env.PROD === 'true' ? 'PROD_OFFLINE_TOKEN' : 'STAGE_OFFLINE_TOKEN';

  if (!offlineToken) {
    throw new Error(
      `Missing ${tokenEnvName} environment variable. Generate one from SSO.`,
    );
  }

  const ssoUrl =
    process.env.PROD === 'true'
      ? 'https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token'
      : 'https://sso.stage.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token';

  const args = [
    '-s',
    '-d',
    'grant_type=refresh_token',
    '-d',
    'client_id=rhsm-api',
    '-d',
    `refresh_token=${offlineToken}`,
    ssoUrl,
  ];

  if (proxy && proxy !== 'undefined') args.unshift('-x', proxy);

  const result = spawnSync('curl', args, { encoding: 'utf-8' });

  if (result.error) {
    throw new Error(`SSO token exchange failed: ${result.error.message}`);
  }

  let json: {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  try {
    json = JSON.parse(result.stdout);
  } catch {
    throw new Error(
      `SSO returned non-JSON response: ${result.stdout.slice(0, 200)}`,
    );
  }

  if (json.access_token) {
    cachedAccessToken = json.access_token;
    return cachedAccessToken;
  }

  throw new Error(
    `SSO token exchange failed: ${json.error_description || json.error || 'unknown error'}`,
  );
}

/**
 * Uploads a .tar.gz archive to the Red Hat Ingress API via curl.
 * Authenticates using a Bearer token obtained from SSO offline token exchange.
 *
 * Jira References: https://issues.redhat.com/browse/RHINENG-21146
 *
 *  @param   {string}                        archivePath - Relative path to the archive in host_archives/.
 *  @param   {number}                        maxRetries  - Number of upload attempts (default 3).
 *  @returns {Promise<{ httpCode: number }>}             Object containing the HTTP response code.
 * @throws {Error} Missing credentials, curl failure, or non-201 response.
 */
export async function uploadArchive(
  archivePath: string,
  maxRetries: number = 3,
) {
  const fullPath = `host_archives/${archivePath}`;
  const proxy = process.env.PROXY;

  const uploadUrl =
    process.env.PROD === 'true'
      ? 'https://console.redhat.com/api/ingress/v1/upload'
      : 'https://console.stage.redhat.com/api/ingress/v1/upload';

  const accessToken = getAccessToken();

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
    '-H',
    `Authorization: Bearer ${accessToken}`,
    '-F',
    `upload=@${fullPath};type=application/vnd.redhat.advisor.collection+tgz`,
    uploadUrl,
  ];

  if (proxy && proxy !== 'undefined') args.unshift('-x', proxy);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = spawnSync('curl', args, { encoding: 'utf-8' });

    if (result.error) {
      lastError = new Error(`Curl failed: ${result.error.message}`);
      if (attempt < maxRetries) {
        console.warn(
          `Upload attempt ${attempt}/${maxRetries} failed (curl error), retrying in 5s...`,
        );
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      throw lastError;
    }

    const stdout = result.stdout.trim();
    const httpCode = Number(stdout.slice(-3));

    if (httpCode === 201) {
      return { httpCode };
    }

    const stderrMsg = result.stderr?.toString().trim() || 'Unknown error';
    lastError = new Error(
      `Upload failed with HTTP code ${httpCode}. stderr: ${stderrMsg}`,
    );

    if (attempt < maxRetries) {
      console.warn(
        `Upload attempt ${attempt}/${maxRetries} failed (HTTP ${httpCode}), retrying in 5s...`,
      );
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
  }

  throw lastError!;
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
