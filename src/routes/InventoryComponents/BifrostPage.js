import React, { useEffect, useState } from 'react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

import {
  INVENTORY_FETCH_BOOTC,
  INVENTORY_PACKAGE_BASED_SYSTEMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  INVENTORY_FETCH_EDGE,
} from '../../Utilities/constants';
import BifrostTable from './BifrostTable';
import useFeatureFlag from '../../Utilities/useFeatureFlag';

const BifrostPage = () => {
  const axios = useAxiosWithPlatformInterceptors();
  const [bootcImages, setBootcImages] = useState();
  const [loaded, setLoaded] = useState(false);
  const edgeParityFilterDeviceEnabled = useFeatureFlag(
    'edgeParity.inventory-list-filter',
  );

  useEffect(() => {
    const fetchBootcImages = async () => {
      setLoaded(false);
      const result = await axios.get(
        `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_BOOTC}&fields[system_profile]=bootc_status`,
      );

      const packageBasedSystems = await axios.get(
        `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_PACKAGE_BASED_SYSTEMS}&per_page=1`,
      );

      const immutableImageBasedSystems = await axios.get(
        `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_EDGE}&per_page=1`,
      );

      const booted = result.results.map(
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
      ];

      if (!edgeParityFilterDeviceEnabled) {
        updated.push({
          image: 'Immutable (OSTree) image based systems',
          systemCount: immutableImageBasedSystems.total,
          hashCommitCount: '-',
        });
      }

      setLoaded(true);
      setBootcImages(updated);
    };

    fetchBootcImages();
  }, [axios]);

  return <BifrostTable bootcImages={bootcImages} loaded={loaded} />;
};

export default BifrostPage;
