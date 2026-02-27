import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ClipboardCopy,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Icon,
  Flex,
  FlexItem,
  TextInput,
  Truncate,
  ValidatedOptions,
} from '@patternfly/react-core';
import { TimesIcon, CheckIcon } from '@patternfly/react-icons';
import EditButton from '../EditButton';

const ensureString = (v) => (typeof v === 'string' ? v : '');

export const NameInlineEdit = ({
  textValue,
  onSubmit,
  writePermissions,
  showCopyButton = false,
}) => {
  const value = ensureString(textValue);
  const [currentValue, setCurrentValue] = useState(value);
  const [isEditingOpen, setEditingOpen] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const isValid = ensureString(currentValue).trim().length !== 0;

  return isEditingOpen ? (
    <FormGroup>
      <div className="pf-v6-c-inline-edit__group">
        <div style={{ width: '100%' }}>
          <TextInput
            aria-label="name"
            value={currentValue}
            onChange={(_e, value) => setCurrentValue(value)}
            validated={!isValid && ValidatedOptions.error}
          />
          <FormHelperText>
            <HelperText aria-live="polite">
              {!isValid && (
                <HelperTextItem variant="error">
                  Name cannot be blank
                </HelperTextItem>
              )}
            </HelperText>
          </FormHelperText>
        </div>
        <div className="pf-v6-c-inline-edit__group pf-v6-m-action-group pf-v6-m-icon-group">
          <div className="pf-v6-c-inline-edit__action pf-v6-m-valid pf-v6-u-display-inline">
            <Button
              icon={<CheckIcon />}
              variant="plain"
              type="button"
              aria-label="submit"
              onClick={() => {
                onSubmit(currentValue);
                setEditingOpen(false);
                setCurrentValue(value);
              }}
              isDisabled={!isValid}
              className="pf-v6-u-display-inline"
            />
          </div>
          <div
            className="pf-v6-c-inline-edit__action"
            style={{
              display: 'inline',
            }}
          >
            <Button
              icon={
                <Icon>
                  <TimesIcon />
                </Icon>
              }
              variant="plain"
              type="button"
              aria-label="cancel"
              onClick={() => {
                setEditingOpen(false);
                setCurrentValue(value);
              }}
              className="pf-v6-u-display-inline"
            />
          </div>
        </div>
      </div>
    </FormGroup>
  ) : (
    <Fragment>
      {showCopyButton ? (
        <Flex
          spaceItems={{ default: 'spaceItemsSm' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <FlexItem style={{ minWidth: 0, maxWidth: '40ch' }}>
            <ClipboardCopy
              isReadOnly
              variant="inline-compact"
              truncation={{ maxCharsDisplayed: 32 }}
            >
              {value || ''}
            </ClipboardCopy>
          </FlexItem>
          <FlexItem>
            <EditButton
              writePermissions={writePermissions}
              onClick={() => setEditingOpen(true)}
            />
          </FlexItem>
        </Flex>
      ) : (
        <>
          {value ? <Truncate maxCharsDisplayed={32} content={value} /> : value}
          <EditButton
            writePermissions={writePermissions}
            onClick={() => setEditingOpen(true)}
          />
        </>
      )}
    </Fragment>
  );
};

NameInlineEdit.propTypes = {
  textValue: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  writePermissions: PropTypes.bool.isRequired,
  showCopyButton: PropTypes.bool,
};
