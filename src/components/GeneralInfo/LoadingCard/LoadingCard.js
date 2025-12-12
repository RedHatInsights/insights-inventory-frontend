import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  Stack,
  StackItem,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/Skeleton';
import { Link, useLocation } from 'react-router-dom';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

const valueToText = (value, singular, plural) => {
  if ((value || value === 0) && singular) {
    return value === 1
      ? `1 ${singular}`
      : `${value} ${plural || `${singular}s`}`;
  }

  if (value === 0) {
    return 'None';
  }

  return value || 'Not available';
};

export const Clickable = ({
  value,
  target,
  plural,
  singular,
  onClick,
  workload,
  title,
}) => {
  const { pathname } = useLocation();
  // const { modalId } = useParams(); is causing regression when using LoadingCard derived components in Federated mode
  const modalId = pathname.split('/').pop();
  useEffect(() => {
    if (target === modalId) {
      onClick({ value, target });
    }
  }, [modalId, target, value]);

  if (target?.[0] === '/') {
    return (
      <InsightsLink to={target} app="inventory">
        {workload ? title : valueToText(value, singular, plural)}
      </InsightsLink>
    );
  }

  return (
    <Link to={`${pathname}/${target}`}>
      {workload ? title : valueToText(value, singular, plural)}
    </Link>
  );
};

Clickable.propTypes = {
  value: PropTypes.node,
  target: PropTypes.string,
  onClick: PropTypes.func,
  plural: PropTypes.string,
  singular: PropTypes.string,
  title: PropTypes.string,
  workload: PropTypes.string,
};

const LoadingCard = ({
  title,
  isLoading = true,
  items = [],
  cardId = 'system-properties-card',
  children,
}) => {
  const columnMod = items.length > 3 ? '2Col' : '3Col';
  return (
    <Card ouiaId={`${cardId}`}>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Content>
              <Content
                component={ContentVariants.h1}
                ouiaId="SystemPropertiesCardTitle"
              >
                {title}
              </Content>
            </Content>
          </StackItem>
          <StackItem isFilled>
            {items.length ? (
              <DescriptionList
                data-ouia-component-id={`${title} title`}
                aria-label={`${title} title`}
                isHorizontal={false}
                isAutoFit={false}
                columnModifier={{
                  default: columnMod,
                }}
              >
                {items.map(
                  (
                    {
                      onClick,
                      value,
                      target,
                      plural,
                      singular,
                      size,
                      title: itemTitle,
                      customClass,
                    },
                    key,
                  ) => {
                    const title =
                      typeof itemTitle === 'string'
                        ? itemTitle
                        : itemTitle?.props?.title;
                    return (
                      <DescriptionListGroup key={key}>
                        <DescriptionListTerm>{itemTitle}</DescriptionListTerm>
                        <DescriptionListDescription
                          className={customClass}
                          data-ouia-component-id={`${title} value`}
                          aria-label={`${title} value`}
                        >
                          {isLoading && (
                            <Skeleton size={size || SkeletonSize.sm} />
                          )}
                          {!isLoading &&
                            ((onClick || target?.[0] === '/') && value ? (
                              <div>
                                <Clickable
                                  onClick={onClick}
                                  value={value}
                                  target={target}
                                  plural={plural}
                                  singular={singular}
                                />
                              </div>
                            ) : (
                              valueToText(value, singular, plural)
                            ))}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    );
                  },
                )}
              </DescriptionList>
            ) : null}
            {children}
          </StackItem>
        </Stack>
      </CardBody>
    </Card>
  );
};

LoadingCard.propTypes = {
  title: PropTypes.node.isRequired,
  isLoading: PropTypes.bool,
  cardId: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.node,
      value: PropTypes.node,
      onClick: PropTypes.func,
      size: PropTypes.oneOf(Object.values(SkeletonSize)),
      plural: PropTypes.string,
      singular: PropTypes.string,
      customClass: PropTypes.string,
    }),
  ),
  children: PropTypes.node,
};

export default LoadingCard;
