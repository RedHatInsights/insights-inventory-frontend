import React from 'react';
import PropTypes from 'prop-types';
import {
  Label,
  LabelGroup,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { useSelector } from 'react-redux';

const BasicInfo = ({ hideInvLink = false, showTags = false }) => {
  const displayName = useSelector(
    ({ entityDetails: { entity } }) => entity?.display_name,
  );
  const systemId = useSelector(({ entityDetails: { entity } }) => entity?.id);
  const tags = useSelector(({ entityDetails: { entity } }) => entity?.tags);
  return (
    <Stack hasGutter>
      <StackItem>
        <Split>
          <SplitItem isFilled>
            <Title headingLevel="h3" size="xl">
              {displayName}
            </Title>
          </SplitItem>
          {!hideInvLink && (
            <SplitItem>
              <a
                className="ins-c-entity-detail__inv-link"
                href={`./insights/inventory/${systemId}`}
              >
                Open in Inventory
              </a>
            </SplitItem>
          )}
        </Split>
      </StackItem>
      {showTags && (
        <StackItem>
          <Split hasGutter>
            <SplitItem>Tags:</SplitItem>
            <SplitItem>
              <LabelGroup>
                {tags?.length !== 0
                  ? tags?.map((item, key) => (
                      <Label variant="outline" key={key}>
                        {item?.namespace && `${item?.namespace}/`}
                        {item?.key}
                        {item?.value && `=${item?.value}`}
                      </Label>
                    ))
                  : 'No tags'}
              </LabelGroup>
            </SplitItem>
          </Split>
        </StackItem>
      )}
    </Stack>
  );
};

BasicInfo.propTypes = {
  hideInvLink: PropTypes.bool,
  showTags: PropTypes.bool,
};

export default BasicInfo;
