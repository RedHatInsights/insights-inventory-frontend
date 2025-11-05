const textFilterSerialiser = (filterConfigItem, value) =>
  `regex(.${filterConfigItem.filterAttribute}, "${value}", "i")`;

const checkboxFilterSerialiser = (filterConfigItem, values) =>
  `.${filterConfigItem.filterAttribute} in [${values
    .map((value) => `"${value}"`)
    .join(',')}]`;

const radioFilterSerialiser = (filterConfigItem, values) =>
  `.${filterConfigItem.filterAttribute} == "${values[0]}"`;

const numberFilterSerialiser = (filterConfigItem, value) =>
  `.${filterConfigItem.filterAttribute} == ${value}`;

const filterSerialisers = {
  text: textFilterSerialiser,
  checkbox: checkboxFilterSerialiser,
  radio: radioFilterSerialiser,
  singleSelect: radioFilterSerialiser,
  number: numberFilterSerialiser,
};

const findFilterSerialiser = (filterConfigItem) => {
  if (filterConfigItem?.filterSerialiser) {
    return filterConfigItem.filterSerialiser;
  } else {
    return (
      filterConfigItem?.filterAttribute &&
      filterSerialisers[filterConfigItem?.type]
    );
  }
};

export const filtersSerialiser = (state, filters) => {
  const queryParts = Object.entries(state || {}).reduce(
    (filterQueryParts, [filterId, value]) => {
      const filterConfigItem = filters.find((filter) => filter.id === filterId);
      const filterSerialiser = findFilterSerialiser(filterConfigItem);

      return [
        ...filterQueryParts,
        ...(filterSerialiser
          ? [filterSerialiser(filterConfigItem, value)]
          : []),
      ];
    },
    [],
  );

  return queryParts.length
    ? queryParts.reduce((allFilters, part) => {
        if (part.filter) {
          const newPart = {
            filter: { ...allFilters.filter, ...part.filter },
          };
          return { ...allFilters, ...newPart };
        }
        return { ...allFilters, ...part };
      }, {})
    : undefined;
};

export const sortSerialiser = ({ index, direction } = {}, columns) =>
  columns[index]?.sortable && {
    orderBy: columns[index].sortable,
    orderHow: direction.toUpperCase(),
  };

export const paginationSerialiser = ({ page, perPage } = {}) => ({
  page,
  perPage,
});
