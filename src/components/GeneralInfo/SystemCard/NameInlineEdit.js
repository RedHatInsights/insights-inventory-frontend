import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Icon,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { TimesIcon, CheckIcon } from '@patternfly/react-icons';
import EditButton from '../EditButton';

export const NameInlineEdit = ({ textValue, onSubmit, writePermissions }) => {
  const [currentValue, setCurrentValue] = useState(textValue);
  const [isEditingOpen, setEditingOpen] = useState(false);

  const isValid = currentValue?.trim().length !== 0;

  return isEditingOpen ? (
    <FormGroup>
      <div className="pf-v5-c-inline-edit__group">
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
        <div className="pf-v5-c-inline-edit__group pf-v5-m-action-group pf-v5-m-icon-group">
          <div className="pf-v5-c-inline-edit__action pf-v5-m-valid pf-v5-u-display-inline">
            <Button
              variant="plain"
              type="button"
              aria-label="submit"
              onClick={() => {
                onSubmit(currentValue);
                setEditingOpen(false);
              }}
              isDisabled={!isValid}
              className="pf-v5-u-display-inline"
              style={{
                color: isValid
                  ? 'var(--pf-v5-global--primary-color--100)'
                  : 'var(--pf-v5-c-button--disabled--Color)',
              }}
            >
              <CheckIcon />
            </Button>
          </div>
          <div
            className="pf-v5-c-inline-edit__action"
            style={{
              display: 'inline',
            }}
          >
            <Button
              variant="plain"
              type="button"
              aria-label="cancel"
              onClick={() => {
                setEditingOpen(false);
                setCurrentValue(textValue);
              }}
              className="pf-v5-u-display-inline"
            >
              <Icon>
                <TimesIcon />
              </Icon>
            </Button>
          </div>
        </div>
      </div>
    </FormGroup>
  ) : (
    <Fragment>
      {textValue}
      <EditButton
        writePermissions={writePermissions}
        onClick={() => setEditingOpen(true)}
      />
    </Fragment>
  );
};

NameInlineEdit.propTypes = {
  textValue: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  writePermissions: PropTypes.bool.isRequired,
};
