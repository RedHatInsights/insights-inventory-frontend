import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Stack,
    StackItem,
    TextContent,
    Text,
    TextList,
    TextVariants,
    TextListItemVariants,
    TextListVariants,
    TextListItem,
    Card,
    CardBody
} from '@patternfly/react-core';
import { Skeleton, SkeletonSize } from '@redhat-cloud-services/frontend-components/Skeleton';
import { useLocation, useHistory } from 'react-router-dom';

const valueToText = (value, singular, plural) => {
    if ((value || value === 0) && singular) {
        return value === 1 ? `1 ${singular}` : `${value} ${plural || `${singular}s`}`;
    }

    if (value === 0) {
        return 'None';
    }

    return value || 'Not available';
};

export const Clickable = ({ value, target, plural, singular, onClick }) => {
    const history = useHistory();
    const { pathname } = useLocation();
    const modalId = pathname.split('/').pop();
    useEffect(() => {
        if (target === modalId) {
            onClick({ value, target });
        }
    }, [modalId, target]);
    return (
        <a
            onClick={ event => {
                event.preventDefault();
                history.push(`${pathname}/${target}`);
            } }
            href={ `${window.location.origin}${window.location.pathname}/${target}` }
        >
            { valueToText(value, singular, plural) }
        </a>
    );
};

Clickable.propTypes = {
    value: PropTypes.node,
    target: PropTypes.string,
    onClick: PropTypes.func,
    plural: PropTypes.string,
    singular: PropTypes.string
};

const LoadingCard = ({ title, isLoading, items, children }) => (
    <Card>
        <CardBody>
            <Stack hasGutter>
                <StackItem>
                    <TextContent>
                        <Text component={TextVariants.h1}>
                            {title}
                        </Text>
                    </TextContent>
                </StackItem>
                <StackItem isFilled>
                    {items.length ?
                        (<TextContent>
                            <TextList component={TextListVariants.dl}>
                                {items.map(({ onClick, value, target, plural, singular, size, title: itemTitle }, key) => (
                                    <Fragment key={key}>
                                        <TextListItem component={TextListItemVariants.dt}>
                                            {itemTitle}
                                        </TextListItem>
                                        <TextListItem component={TextListItemVariants.dd}>
                                            {isLoading && <Skeleton size={size || SkeletonSize.sm} />}
                                            {!isLoading && (
                                                onClick && value ?
                                                    <Clickable
                                                        onClick={onClick}
                                                        value={value}
                                                        target={target}
                                                        plural={plural}
                                                        singular={singular}
                                                    /> :
                                                    valueToText(value, singular, plural)
                                            )}
                                        </TextListItem>
                                    </Fragment>
                                ))}
                            </TextList>
                        </TextContent>) : null}
                    {children}
                </StackItem>
            </Stack>
        </CardBody>

    </Card>

);

LoadingCard.propTypes = {
    title: PropTypes.node.isRequired,
    isLoading: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.node,
        value: PropTypes.node,
        onClick: PropTypes.func,
        size: PropTypes.oneOf(Object.values(SkeletonSize)),
        plural: PropTypes.string,
        singular: PropTypes.string
    })),
    children: PropTypes.node
};

LoadingCard.defaultProps = {
    isLoading: true,
    items: []
};

export default LoadingCard;
