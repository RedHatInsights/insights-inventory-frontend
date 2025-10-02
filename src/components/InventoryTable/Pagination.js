import React from 'react';
import { Pagination, PaginationVariant } from '@patternfly/react-core';
import PropTypes from 'prop-types';

/**
 * Bottom pagination used in table. It can remember what page user is on if user entered the page number in input.
 *  @param   {object}     props                 props object
 *  @param   {number}     props.total           total number of items
 *  @param   {number}     props.page            current page
 *  @param   {number}     props.perPage         items per page
 *  @param   {string}     props.direction       direction of the pagination
 *  @param   {boolean}    props.isFull          if true, the pagination is full
 *  @param   {boolean}    props.hasAccess       if true, the pagination has access
 *  @param   {object}     props.paginationProps pagination props
 *  @param   {Function}   props.onRefreshData   on refresh data function
 *  @param   {boolean}    props.loaded          if true, the pagination is loaded
 *  @param   {string}     props.ouiaId          ouia id for testing
 *  @returns {React.node}                       React node with pagination
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
   *  @param   {event}  _event  html event to figure if target was input.
   *  @param   {number} pageArg current page to change to.
   *  @returns {void}           void
   */
  const onSetPage = (_event, pageArg) => onRefreshData({ page: pageArg });

  /**
   * This method changes per page, it automatically sets page to first one.
   * It also applies previous sort, filters, etc.
   *  @param   {event}  _event     event is now not used.
   *  @param   {number} perPageArg new perPage set by user.
   *  @returns {void}              void
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
