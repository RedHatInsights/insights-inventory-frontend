import fs from 'fs';
import path from 'path';
import { MANIFEST_PATH, RUN_ID, GLOBAL_DATA_PATH } from './constants';

interface ArchiveEntry {
  archiveName: string;
  workingDir: string;
}

/**
 * Records archive metadata to a local JSON manifest for tracking and cleanup.
 */
export function recordToManifest(entry: ArchiveEntry) {
  let entries = [];

  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      entries = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    } catch (e) {
      entries = [];
    }
  }

  entries.push(entry);

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2));
}

/**
 * Deletes all archives and directories listed in the manifest,
 * then removes the manifest file itself.
 */
export function cleanupAllArchives() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log(`No manifest found for run ${RUN_ID}. Skipping...`);
    return;
  }

  try {
    const entries = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

    for (const entry of entries) {
      const archivePath = path.resolve('host_archives', entry.archiveName);
      const dirPath = path.resolve(entry.workingDir);

      if (fs.existsSync(archivePath)) {
        fs.unlinkSync(archivePath);
      }

      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    }
    console.log(
      `All ${entries.length} listed directories and archives have been deleted.`,
    );

    fs.unlinkSync(MANIFEST_PATH);
  } catch (error) {
    console.error('Error during cleanupAllArchives:', error);
  }
}

/**
 * Deletes the global test data file from the filesystem if it exists.
 */
export function cleanupGlobalTestData() {
  if (!fs.existsSync(GLOBAL_DATA_PATH)) {
    console.log('No global test data file found. Skipping...');
    return;
  }

  try {
    fs.unlinkSync(GLOBAL_DATA_PATH);
    console.log(`Deleted ${GLOBAL_DATA_PATH}`);
  } catch (error) {
    console.error('Error during cleanupGlobalTestData:', error);
  }
}
