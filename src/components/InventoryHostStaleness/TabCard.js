import {
  Button,
  Card,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Modal,
  Tooltip,
} from '@patternfly/react-core';
import React from 'react';
import BaseDropdown from './BaseDropDown';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import {
  RESET_TO_DEFAULT,
  systemCullingItems,
  systemStalenessItems,
  systemStalenessWarningItems,
} from './constants';
import { useState } from 'react';

const TabCard = ({
  edit,
  setEdit,
  filter,
  setFilter,
  activeTabKey,
  newFormValues,
  setNewFormValues,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const resetToStandard = () => {
    // console.log('blabla 2 here');
  };

  const resetToOriginalValues = () => {
    setNewFormValues(filter);
    setEdit(!edit);
  };

  const dropdownArray = (activeTabKey) => [
    systemStalenessItems(activeTabKey),
    systemStalenessWarningItems(activeTabKey),
    systemCullingItems(activeTabKey),
  ];

  const updateHost = () => {};
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
                modalMessage={item[0].modalMessage}
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
                <Tooltip content={RESET_TO_DEFAULT}>
                  <OutlinedQuestionCircleIcon className="pf-u-ml-xs" />
                </Tooltip>
              </FlexItem>
            </Flex>
          )}

          {edit && (
            <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
              <Button
                className="pf-u-mt-md"
                size={'sm'}
                onClick={() => handleModalToggle()}
              >
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
              <Modal
                variant="small"
                title="Basic modal"
                isOpen={isModalOpen}
                onClose={handleModalToggle}
                actions={[
                  <Button key="confirm" variant="primary" onClick={updateHost}>
                    Confirm
                  </Button>,
                  <Button
                    key="cancel"
                    variant="link"
                    onClick={handleModalToggle}
                  >
                    Cancel
                  </Button>,
                ]}
                ouiaId="BasicModal"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </Modal>
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
