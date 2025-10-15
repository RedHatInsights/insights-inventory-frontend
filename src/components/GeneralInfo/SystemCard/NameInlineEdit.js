import React, { Fragment, useEffect, useState } from 'react';
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

  useEffect(() => {
    setCurrentValue(textValue);
  }, [textValue]);

  const isValid = currentValue?.trim().length !== 0;

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
                setCurrentValue(textValue);
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
                setCurrentValue(textValue);
              }}
              className="pf-v6-u-display-inline"
            />
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
