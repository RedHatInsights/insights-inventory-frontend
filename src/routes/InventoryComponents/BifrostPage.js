import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  INVENTORY_FETCH_BOOTC,
  INVENTORY_FETCH_NON_BOOTC,
  INVENTORY_FILTER_NO_HOST_TYPE,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
} from '../../Utilities/constants';
import BifrostTable from './BifrostTable';

const BifrostPage = () => {
  const [bootcImages, setBootcImages] = useState();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchBootcImages = async () => {
      setLoaded(false);
      const result = await axios.get(
        `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_BOOTC}&fields[system_profile]=bootc_status`
      );

      const packageBasedSystems = await axios.get(
        `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_NON_BOOTC}&${INVENTORY_FILTER_NO_HOST_TYPE}&per_page=1`
      );

      const booted = result.data.results.map(
        (system) => system.system_profile.bootc_status.booted
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
          systemCount: packageBasedSystems.data.total,
          hashCommitCount: '-',
        },
      ];

      setLoaded(true);
      setBootcImages(updated);
    };

    fetchBootcImages();
  }, []);

  return <BifrostTable bootcImages={bootcImages} loaded={loaded} />;
};

export default BifrostPage;
