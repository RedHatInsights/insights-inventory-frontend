import React from 'react';
import { PatchAppData } from '@redhat-cloud-services/host-inventory-client';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

interface TemplateColumnProps {
  value: PatchAppData;
}

const Template = ({ value }: TemplateColumnProps) => {
  const templateName = value?.template_name;
  const templateUUID = value?.template_uuid;

  return templateName && templateUUID ? (
    <InsightsLink
      app="content"
      to={{ pathname: `/templates/${templateUUID}` }}
      preview={false}
    >
      {templateName}
    </InsightsLink>
  ) : (
    'No template'
  );
};

export default Template;
