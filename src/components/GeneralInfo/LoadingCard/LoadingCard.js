import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Stack,
  StackItem,
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
  columnModifier: columnModifierProp,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const columnMod = columnModifierProp ?? '2Col';
  return (
    <Card ouiaId={`${cardId}`} isExpanded={isExpanded}>
      <CardHeader onExpand={() => setIsExpanded((prev) => !prev)}>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>
          <Stack hasGutter>
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
      </CardExpandableContent>
    </Card>
  );
};

/* eslint-disable jsdoc/check-line-alignment -- alignment varies by JSDoc parser */
/**
 * Default column layout: 1 column when items.length < 4, else 2 columns.
 * Use when passing columnModifier to LoadingCard.
 *
 * @param {Array} items The items array passed to LoadingCard
 * @returns {'1Col'|'2Col'} Column modifier value
 */
/* eslint-enable jsdoc/check-line-alignment */
export const getDefaultColumnModifier = (items) =>
  (items?.length ?? 0) < 4 ? '1Col' : '2Col';

LoadingCard.propTypes = {
  title: PropTypes.node.isRequired,
  isLoading: PropTypes.bool,
  cardId: PropTypes.string,
  /** Column layout: '1Col' or '2Col'. If omitted, defaults to '2Col'. Use getDefaultColumnModifier(items) for default behavior. */
  columnModifier: PropTypes.oneOf(['1Col', '2Col']),
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
