import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
} from '@patternfly/react-core';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/Skeleton';
import { Link, useLocation } from 'react-router-dom';

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

export const Clickable = ({ value, target, plural, singular, onClick }) => {
  const { pathname } = useLocation();
  // const { modalId } = useParams(); is causing regression when using LoadingCard derived components in Federated mode
  const modalId = pathname.split('/').pop();
  useEffect(() => {
    if (target === modalId) {
      onClick({ value, target });
    }
  }, [modalId, target]);

  return (
    <Link to={`${pathname}/${target}`}>
      {valueToText(value, singular, plural)}
    </Link>
  );
};

Clickable.propTypes = {
  value: PropTypes.node,
  target: PropTypes.string,
  onClick: PropTypes.func,
  plural: PropTypes.string,
  singular: PropTypes.string,
};

const LoadingCard = ({
  title,
  isLoading,
  items,
  cardId = 'system-properties-card',
  children,
}) => (
  <Card ouiaId={`${cardId}`}>
    <CardBody>
      <Stack hasGutter>
        <StackItem>
          <TextContent>
            <Text
              component={TextVariants.h1}
              ouiaId="SystemPropertiesCardTitle"
            >
              {title}
            </Text>
          </TextContent>
        </StackItem>
        <StackItem isFilled>
          {items.length ? (
            <TextContent>
              <TextList component={TextListVariants.dl}>
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
                    key
                  ) => {
                    const title =
                      typeof itemTitle === 'string'
                        ? itemTitle
                        : itemTitle?.props?.title;

                    return (
                      <Fragment key={key}>
                        <TextListItem
                          component={TextListItemVariants.dt}
                          data-ouia-component-id={`${title} title`}
                          aria-label={`${title} title`}
                        >
                          {itemTitle}
                        </TextListItem>
                        <TextListItem
                          className={customClass}
                          component={TextListItemVariants.dd}
                          data-ouia-component-id={`${title} value`}
                          aria-label={`${title} value`}
                        >
                          {isLoading && (
                            <Skeleton size={size || SkeletonSize.sm} />
                          )}
                          {!isLoading &&
                            (onClick && value ? (
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
                        </TextListItem>
                      </Fragment>
                    );
                  }
                )}
              </TextList>
            </TextContent>
          ) : null}
          {children}
        </StackItem>
      </Stack>
    </CardBody>
  </Card>
);

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
    })
  ),
  children: PropTypes.node,
};

LoadingCard.defaultProps = {
  isLoading: true,
  items: [],
};

export default LoadingCard;
