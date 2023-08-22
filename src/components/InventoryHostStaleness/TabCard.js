import {
  Button,
  Card,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Modal,
} from '@patternfly/react-core';
import React from 'react';
import BaseDropdown from './BaseDropDown';
import PropTypes from 'prop-types';
import {
  HostStalenessResetDefaultPopover,
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
  const standardValues = {
    system_staleness_delta: '1',
    system_stale_warning_delta: '7',
    system_culling_delta: '14',
    edge_staleness_delta: '2',
    edge_stale_warning_delta: '120',
    edge_culling_delta: '180',
  };

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const resetToStandard = () => {
    setNewFormValues(standardValues);
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
                data-ouia-component-id={item[0].title}
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
              {/* {newFormValues[item] && <p>This is the error message</p>} */}
              {/* {true && <p>This is the error message</p>}
              {true && <p>This is the error message</p>}
              {true && <p>This is the error message</p>}
              {true && <p>This is the error message</p>}
              {true && <p>This is the error message</p>} */}
            </GridItem>
          ))}
          {edit && (
            <Flex>
              <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
                <a onClick={() => resetToStandard()} className="pf-u-ml-sm ">
                  Reset to default setting
                </a>
                <HostStalenessResetDefaultPopover />
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
                titleIconVariant="warning"
                title="Update organization level setting"
                isOpen={isModalOpen}
                onClose={handleModalToggle}
                actions={[
                  <Button key="confirm" variant="primary" onClick={updateHost}>
                    Update
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
                Changing the organization level setting for system staleness and
                culling may impact your systems. X systems will be culled as a
                result.
              </Modal>
            </Flex>
          )}
        </Grid>
      </Card>
    </React.Fragment>
  );
};

TabCard.propTypes = {
  filter: PropTypes.object,
  newFormValues: PropTypes.any,
  setNewFormValues: PropTypes.any,
  setFilter: PropTypes.any,
  activeTabKey: PropTypes.number,
  edit: PropTypes.bool,
  setEdit: PropTypes.any,
};
export default TabCard;
