/* eslint-disable camelcase */
import React from 'react';
import { Pagination, PaginationVariant } from '@patternfly/react-core';
import PropTypes from 'prop-types';

/**
 * Bottom pagination used in table. It can remember what page user is on if user entered the page number in input.
 *  @param props
 *  @param props.total
 *  @param props.page
 *  @param props.perPage
 *  @param props.direction
 *  @param props.isFull
 *  @param props.hasAccess
 *  @param props.paginationProps
 *  @param props.onRefreshData
 *  @param props.loaded
 *  @param props.ouiaId
 */
const FooterPagination = ({
  total,
  page,
  perPage,
  direction,
  isFull,
  hasAccess,
  paginationProps,
  onRefreshData,
  loaded,
  ouiaId,
}) => {
  /**
   * Thi method sets new page and combines previous props to apply sort, filters etc.
   *  @param {*} _event  html event to figure if target was input.
   *  @param {*} pageArg current page to change to.
   */
  const onSetPage = (_event, pageArg) => onRefreshData({ page: pageArg });

  /**
   * This method changes per page, it automatically sets page to first one.
   * It also applies previous sort, filters, etc.
   *  @param {*} _event     event is now not used.
   *  @param {*} perPageArg new perPage set by user.
   */
  const onPerPageSelect = (_event, perPageArg) =>
    onRefreshData({ page: 1, per_page: perPageArg });

  return loaded || !hasAccess ? (
    <Pagination
      {...(isFull && {
        variant: PaginationVariant.bottom,
      })}
      isDisabled={!hasAccess}
      itemCount={total}
      page={page}
      perPage={perPage}
      dropDirection={direction}
      onSetPage={onSetPage}
      onPerPageSelect={onPerPageSelect}
      titles={{
        items: '',
        optionsToggleAriaLabel: 'Items per page',
      }}
      ouiaId={ouiaId}
      {...paginationProps}
    />
  ) : null;
};

FooterPagination.propTypes = {
  perPage: PropTypes.number,
  total: PropTypes.number,
  page: PropTypes.number,
  isFull: PropTypes.bool,
  hasAccess: PropTypes.bool,
  direction: PropTypes.string,
  paginationProps: PropTypes.object,
  loaded: PropTypes.bool,
  onRefreshData: PropTypes.func.isRequired,
  ouiaId: PropTypes.string,
};

FooterPagination.defaultProps = {
  total: 0,
  isFull: false,
  direction: 'up',
  hasAccess: true,
};

export default FooterPagination;
