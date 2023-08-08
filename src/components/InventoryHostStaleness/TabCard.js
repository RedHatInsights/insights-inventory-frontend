import {
  Button,
  Card,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Tooltip,
} from '@patternfly/react-core';
import React from 'react';
import BaseDropdown from './BaseDropDown';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import {
  systemCullingItems,
  systemStalenessItems,
  systemStalenessWarningItems,
} from './constants';

const TabCard = ({
  edit,
  setEdit,
  filter,
  setFilter,
  activeTabKey,
  newFormValues,
  setNewFormValues,
}) => {
  const resetToStandard = () => {
    // console.log('blabla 2 here');
  };

  const resetToOriginalValues = () => {
    setNewFormValues(filter);
    setEdit(!edit);
  };

  //need to repass in the values if the button is clicked

  //loop through 3 arrays -> while looping im  and pass in those array values and then
  //the currentItem and value can be filter[item.apikey]

  const dropdownArray = (activeTabKey) => [
    systemStalenessItems(activeTabKey),
    systemStalenessWarningItems(activeTabKey),
    systemCullingItems(activeTabKey),
  ];
  // console.log(dropdownArray(activeTabKey), 'active dropdown key here');
  // console.log(
  //   systemCullingItems(activeTabKey),
  //   'systemCullingItems dropdown key here'
  // );
  // console.log(newFormValues, 'newFormValues here');

  return (
    <React.Fragment>
      <Card isPlain className="pf-u-mb-lg">
        <Grid span={3}>
          {dropdownArray(activeTabKey).map((item) => (
            <GridItem key={item[0].title}>
              <BaseDropdown
                dropdownItems={item}
                currentItem={newFormValues[item[0].apiKey]}
                disabled={!edit}
                title={item[0].title}
                filter={filter}
                setFilter={setFilter}
                newFormValues={newFormValues}
                setNewFormValues={setNewFormValues}
                edit={edit}
              />
            </GridItem>
          ))}
          {edit && (
            <Flex>
              <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
                <a
                  onClick={resetToStandard(
                    setNewFormValues /*, defaultValues*/
                  )}
                  className="pf-u-ml-sm "
                >
                  Reset to default setting
                </a>
                <Tooltip content={'testing testing 123'}>
                  <OutlinedQuestionCircleIcon className="pf-u-ml-xs" />
                </Tooltip>
              </FlexItem>
            </Flex>
          )}

          {edit && (
            <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
              <Button className="pf-u-mt-md" size={'sm'}>
                Save
              </Button>
              {/* reset to previous items, it repasses in the values   */}
              <Button
                className="pf-u-mt-md"
                size={'sm'}
                variant="link"
                onClick={() => resetToOriginalValues()}
              >
                Cancel
              </Button>
            </Flex>
          )}
        </Grid>
      </Card>
    </React.Fragment>
  );
};

TabCard.propTypes = {
  filter: PropTypes.string,
  newFormValues: PropTypes.any,
  setNewFormValues: PropTypes.any,
  setFilter: PropTypes.any,
  activeTabKey: PropTypes.number,
  edit: PropTypes.bool,
  setEdit: PropTypes.any,
};
export default TabCard;

{
  /* <GridItem>
            <BaseDropdown
              dropdownItems={systemStalenessItems(activeTabKey)}
              //this value will come from api. Api -> Filter -> here
              //If this is newForm value, and we just update that, we should be able to revert
              //how do I map newForm value to this dropdown?
              // currentItem={mapApiToValue(
              //   systemStalenessItems(activeTabKey),
              //   filter
              // )}
              currentItem={mapApiToValue(
                systemStalenessItems(activeTabKey),
                filter
              )}
              disabled={!edit}
              title={'System staleness'}
              filter={filter}
              setFilter={setFilter}
              newFormValues={newFormValues}
              setNewFormValues={setNewFormValues}
            />
          </GridItem>
          <GridItem>
            <BaseDropdown
              dropdownItems={systemStalenessWarningItems(activeTabKey)}
              //this value will come from api. Api -> Filter -> here
              currentItem={systemStalenessWarningItems(activeTabKey)[2].name}
              disabled={!edit}
              title={'System stale warning'}
              filter={filter}
              setFilter={setFilter}
              newFormValues={newFormValues}
              setNewFormValues={setNewFormValues}
            />
          </GridItem>
          <GridItem>
            <BaseDropdown
              dropdownItems={systemCullingItems(activeTabKey)}
              currentItem={systemCullingItems(activeTabKey)[4].name}
              disabled={!edit}
              title={'System culling'}
              filter={filter}
              setFilter={setFilter}
              newFormValues={newFormValues}
              setNewFormValues={setNewFormValues}
            />
          </GridItem> */
}
