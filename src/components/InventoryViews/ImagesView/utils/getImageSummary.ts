import type { BootcSystem } from '../hooks/useImageQueries';

/**
 * Aggregation of systems for a single image digest (hash).
 */
type ImageHash = { image_digest: string; hashSystemCount: number };

/**
 * Aggregated view of a single image across all systems: image name, total system count,
 * and per-digest (hash) breakdown with system counts.
 */
type ImageEntry = {
  image: string;
  systemCount: number;
  hashes: Record<string, ImageHash>;
  hashCommitCount: number;
};

/**
 * Aggregates bootc image usage from a list of systems into a summary per image.
 *
 * For each system's booted image (from `system_profile.bootc_status.booted`), groups by
 * image name and then by image digest. Entries with missing `image` or `image_digest` are
 * skipped.
 *
 *  @param data - List of systems with bootc (bootable container) profile data
 *  @returns    Array of image entries, one per unique image name, each with system count,
 *              number of distinct digests (hashCommitCount), and per-digest system counts in `hashes`
 */
export const getImageSummary = (data: BootcSystem[]) => {
  const systemsBooted = data.map(
    (system) => system.system_profile.bootc_status.booted,
  );

  const images: Record<string, ImageEntry> = {};
  systemsBooted.forEach((bootedImage) => {
    const { image, image_digest } = bootedImage;
    if (!image || !image_digest) return;

    if (!images[image]) {
      images[image] = {
        image,
        systemCount: 1,
        hashes: {},
        hashCommitCount: 0,
      };
    } else {
      images[image].systemCount += 1;
    }

    if (!images[image].hashes[image_digest]) {
      images[image].hashes[image_digest] = {
        image_digest,
        hashSystemCount: 1,
      };
      images[image].hashCommitCount += 1;
    } else {
      images[image].hashes[image_digest].hashSystemCount += 1;
    }
  });

  return Object.values(images);
};

export default getImageSummary;
