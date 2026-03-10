import React, { useEffect, useState } from 'react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { PER_PAGE_MAX, INITIAL_PAGE } from '../../constants';

import {
  INVENTORY_FETCH_BOOTC,
  INVENTORY_PACKAGE_BASED_SYSTEMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  INVENTORY_FETCH_EDGE,
} from '../../Utilities/constants';
import BifrostTable from './BifrostTable';

const BifrostPage = () => {
  const axios = useAxiosWithPlatformInterceptors();
  const [bootcImages, setBootcImages] = useState();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoaded(false);

      const getBootcBased = async () => {
        let page = INITIAL_PAGE;
        let hasMore = true;
        let allResults = [];
        while (hasMore) {
          const { results } = await axios.get(
            `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_BOOTC}&fields[system_profile]=bootc_status&per_page=${PER_PAGE_MAX}&page=${page}`,
          );
          allResults.push(...results);
          hasMore = results.length === PER_PAGE_MAX;
          page++;
        }

        return allResults;
      };

      const getPackageBased = async () =>
        axios.get(
          `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_PACKAGE_BASED_SYSTEMS}&per_page=1`,
        );

      const getImmutableBased = async () =>
        axios.get(
          `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_EDGE}&per_page=1`,
        );

      const [
        bootcBasedSystems,
        packageBasedSystems,
        immutableImageBasedSystems,
      ] = await Promise.all([
        getBootcBased(),
        getPackageBased(),
        getImmutableBased(),
      ]);

      const booted = bootcBasedSystems.map(
        (system) => system.system_profile.bootc_status.booted,
      );

      const target = {};

      booted.forEach((bootedImage) => {
        const { image, image_digest } = bootedImage;
        if (!target[image]) {
          target[image] = {
            image,
            systemCount: 1,
            hashes: {},
            hashCommitCount: 0,
          };
        } else {
          target[image].systemCount += 1;
        }

        if (!target[image].hashes[image_digest]) {
          target[image].hashes[image_digest] = {
            image_digest,
            hashSystemCount: 1,
          };
          target[image].hashCommitCount += 1;
        } else {
          target[image].hashes[image_digest].hashSystemCount += 1;
        }
      });

      const updated = [
        ...Object.values(target).map((val) => ({
          ...val,
          hashes: Object.values(val.hashes),
        })),
        {
          image: 'Package based systems',
          systemCount: packageBasedSystems.total,
          hashCommitCount: '-',
        },
        {
          image: 'Immutable (OSTree) image based systems',
          systemCount: immutableImageBasedSystems.total,
          hashCommitCount: '-',
        },
      ];

      setLoaded(true);
      setBootcImages(updated);
    };

    fetchAll();
  }, [axios]);

  return <BifrostTable bootcImages={bootcImages} loaded={loaded} />;
};

export default BifrostPage;
