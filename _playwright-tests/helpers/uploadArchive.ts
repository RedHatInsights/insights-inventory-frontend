import { spawnSync } from 'child_process';

/**
 * Uploads an archive file to the Red Hat ingress API using `curl`.
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
