import React from 'react';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import CellValue from '../../CellValue';
import { PatchAppData } from '@redhat-cloud-services/host-inventory-client';

interface TemplateColumnProps {
  appData: PatchAppData | undefined;
}

const Template = ({ appData }: TemplateColumnProps) => {
  const templateName = appData?.template_name;
  const templateUUID = appData?.template_uuid;

  const value =
    templateName && templateUUID ? (
      <InsightsLink
        app="content"
        to={{ pathname: `/templates/${templateUUID}` }}
        preview={false}
      >
        {templateName}
      </InsightsLink>
    ) : null;

  return (
    <CellValue value={appData ? value : undefined} fallback="No template" />
  );
};

export default Template;
