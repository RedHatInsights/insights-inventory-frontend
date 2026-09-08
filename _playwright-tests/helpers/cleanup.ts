import fs from 'fs';
import path from 'path';
import { MANIFEST_PATH, RUN_ID, GLOBAL_DATA_PATH } from './constants';
import { deleteWorkspaceById } from './apiHelpers';

interface ArchiveEntry {
  archiveName: string;
  workingDir: string;
}

interface WorkspaceEntry {
  id: string;
  name: string;
}

const WORKSPACE_MANIFEST_PATH = path.resolve(
  __dirname,
  `../.workspace-manifest-${RUN_ID}.jsonl`,
);

/**
 * Records archive metadata to a local JSON manifest for tracking and cleanup.
 *  @param entry
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
 * Records a workspace created by a test so teardown can delete it.
 * Only session-created workspaces belong here - reusable fixture workspaces
 * must survive the run.
 *  @param entry
 */
export function recordWorkspaceToManifest(entry: WorkspaceEntry) {
  try {
    fs.appendFileSync(WORKSPACE_MANIFEST_PATH, `${JSON.stringify(entry)}\n`);
  } catch (error) {
    console.error('Failed to record workspace for cleanup:', error);
  }
}

/**
 * Deletes every workspace created during this run, then removes the manifest.
 */
export async function cleanupSessionWorkspaces() {
  if (!fs.existsSync(WORKSPACE_MANIFEST_PATH)) {
    console.log(`No workspaces created in run ${RUN_ID}. Skipping...`);
    return;
  }

  let entries: WorkspaceEntry[] = [];
  try {
    entries = fs
      .readFileSync(WORKSPACE_MANIFEST_PATH, 'utf-8')
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as WorkspaceEntry);
  } catch (error) {
    console.error('Error reading the workspace manifest:', error);
    return;
  }

  // Dedupe: a retried test records the same workspace more than once.
  const uniqueEntries = [...new Map(entries.map((e) => [e.id, e])).values()];
  let deleted = 0;

  for (const entry of uniqueEntries) {
    try {
      await deleteWorkspaceById(entry.id);
      deleted++;
    } catch (error) {
      console.warn(
        `Failed to delete workspace "${entry.name}" (${entry.id}):`,
        error,
      );
    }
  }

  console.log(
    `Deleted ${deleted}/${uniqueEntries.length} workspaces created in this run.`,
  );

  try {
    fs.unlinkSync(WORKSPACE_MANIFEST_PATH);
  } catch (error) {
    console.error('Error removing the workspace manifest:', error);
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
