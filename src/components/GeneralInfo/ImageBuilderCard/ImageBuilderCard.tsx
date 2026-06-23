import React, { useEffect, useState, type ComponentProps } from 'react';
import LoadingCard from '../LoadingCard';
import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';

const IMAGE_TYPE_DISPLAY_MAP: Record<string, string> = {
  aws: 'Amazon Web Services',
  ami: 'Amazon Web Services',
  azure: 'Microsoft Azure',
  vhd: 'Microsoft Azure',
  gcp: 'Google Cloud',
  'guest-image': 'Virtualization - Guest image (.qcow2)',
  'image-installer': 'Bare metal - Installer (.iso)',
  'network-installer': 'Network - Installer (.iso)',
  oci: 'Oracle Cloud Infrastructure',
  'pxe-tar-xz': 'Network - PXE boot (.tar.xz)',
  vsphere: 'VMware vSphere - Virtual disk (.vmdk)',
  'vsphere-ova': 'VMware vSphere - Open virtualization format (.ova)',
  wsl: 'WSL - Windows Subsystem for Linux (.wsl)',
  'bootable-container-iso': 'RHEL Image Mode',
};

export const mapImageType = (rawType: string | undefined): string => {
  if (!rawType) {
    return 'Not available';
  }

  const mapped = IMAGE_TYPE_DISPLAY_MAP[rawType];
  if (mapped) {
    return mapped;
  }

  console.error(
    `[ImageBuilderCard] Unknown image type "${rawType}" — displaying raw value`,
  );
  return rawType;
};

type BlueprintData = {
  name?: string;
  image_requests?: Array<{ image_type?: string }>;
};

export type ImageBuilderCardProps = {
  blueprintId: string;
};

export const ImageBuilderCard = ({ blueprintId }: ImageBuilderCardProps) => {
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchBlueprint = async () => {
      try {
        const data = await instance.get<BlueprintData, BlueprintData>(
          `/api/image-builder/v1/blueprints/${blueprintId}`,
        );
        if (!cancelled) {
          setBlueprint(data);
        }
      } catch {
        if (!cancelled) {
          setBlueprint(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchBlueprint();
    return () => {
      cancelled = true;
    };
  }, [blueprintId]);

  const imageType = blueprint?.image_requests?.[0]?.image_type;
  const blueprintName = blueprint?.name;
  const linkHref = `/insights/image-builder?blueprint_id=${blueprintId}`;

  const items = [
    {
      title: 'Name',
      value: blueprintName ? (
        <a href={linkHref}>{blueprintName}</a>
      ) : (
        'Not available'
      ),
    },
    {
      title: 'Target',
      value: mapImageType(imageType),
    },
  ];

  return (
    <LoadingCard
      title="Image builder"
      cardId="image-builder-card"
      isLoading={isLoading}
      items={items as unknown as ComponentProps<typeof LoadingCard>['items']}
    />
  );
};

export default ImageBuilderCard;
