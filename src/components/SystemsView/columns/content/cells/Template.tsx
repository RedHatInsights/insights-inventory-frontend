import React from 'react';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import CellValue from '../../CellValue';
import { PatchAppData } from '@redhat-cloud-services/host-inventory-client';

const PATCH_DATA_NOT_AVAILABLE =
  'Patch data has not been collected for this system';
export const NOT_SET = 'No template';

interface TemplateColumnProps {
  appData: PatchAppData | undefined;
}

const Template = ({ appData }: TemplateColumnProps) => {
  if (!appData) {
    return <CellValue type="notAvailable" reason={PATCH_DATA_NOT_AVAILABLE} />;
  }

  const templateName = appData.template_name;
  const templateUUID = appData.template_uuid;

  if (!templateName || !templateUUID) {
    return <CellValue type="notSet" value={NOT_SET} />;
  }

  return (
    <CellValue
      type="present"
      value={
        <InsightsLink
          app="content"
          to={{ pathname: `/templates/${templateUUID}` }}
          preview={false}
        >
          {templateName}
        </InsightsLink>
      }
    />
  );
};

export default Template;
