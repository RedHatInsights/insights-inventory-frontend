import { useState } from 'react';
import { ModalVariant } from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';
import sortBy from 'lodash/sortBy';

/**
 * Custom hook to manage modal state and functionality for system details cards
 *  @param   {Function} navigate - Navigation function to handle modal close with history
 *  @returns {object}            Modal state and handlers
 */
const useModalState = (navigate) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalVariant, setModalVariant] = useState(ModalVariant.small);
  const [modalData, setModalData] = useState({
    cells: [],
    rows: [],
    expandable: false,
    filters: [],
  });

  /**
   * Sorts modal table data
   *  @param {Event}  _event         - Sort event (unused)
   *  @param {number} index          - Column index to sort by
   *  @param {string} direction      - Sort direction ('asc' or 'desc')
   *  @param {Array}  customRows     - Optional custom rows to sort (uses modalData.rows if not provided)
   *  @param {number} secondaryIndex - Optional secondary column index for multi-column sorting
   */
  const onSort = (_event, index, direction, customRows, secondaryIndex) => {
    const sortAttributes = [
      (row) => {
        const value = row[index]?.sortValue || row[index];
        return String(value).toLocaleLowerCase();
      },
    ];

    if (secondaryIndex !== undefined) {
      sortAttributes.push((row) => {
        const value = row[secondaryIndex]?.sortValue || row[secondaryIndex];
        return value.toLocaleLowerCase();
      });
    }

    const toSort = [...(customRows || modalData.rows)];
    const sorted = sortBy(toSort, sortAttributes);

    setModalData((prevData) => ({
      ...prevData,
      rows: direction === SortByDirection.asc ? sorted : [...sorted].reverse(),
    }));
  };

  /**
   * Toggles modal open/closed state and sets modal content
   *  @param {string} modalTitle      - Title to display in modal header
   *  @param {object} data            - Modal data object containing cells, rows, expandable, filters
   *  @param          data.cells
   *  @param          data.rows
   *  @param {string} modalVariant    - Modal size variant (small, medium, large)
   *  @param          data.expandable
   *  @param          data.filters
   */
  const handleModalToggle = (
    modalTitle = '',
    { cells, rows, expandable, filters } = {},
    modalVariant = ModalVariant.small,
  ) => {
    if (isModalOpen) {
      navigate(-1);
    }

    setIsModalOpen(!isModalOpen);
    setModalTitle(modalTitle);
    setModalVariant(modalVariant);
    setModalData({
      cells,
      rows,
      expandable,
      filters,
    });

    // Auto-sort rows when modal opens with data
    if (rows) {
      onSort(undefined, expandable ? 1 : 0, SortByDirection.asc, rows);
    }
  };

  return {
    isModalOpen,
    modalTitle,
    modalVariant,
    modalData,
    onSort,
    handleModalToggle,
  };
};

export default useModalState;
