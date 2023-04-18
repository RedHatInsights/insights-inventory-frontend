import React from 'react';
import { Modal } from '@patternfly/react-core';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import componentMapper from '@data-driven-forms/pf4-component-mapper/component-mapper';
import PropTypes from 'prop-types';

const RepoModal = ({
    isModalOpen,
    title,
    titleIconVariant,
    closeModal,
    submitLabel,
    schema,
    initialValues,
    variant,
    reloadData,
    size,
    onSubmit,
    customFormTemplate,
    additionalMappers
}) => {
    return (
        <Modal
            ouiaId="group-modal"
            variant={size ?? 'small'}
            title={title}
            titleIconVariant={titleIconVariant ?? null}
            isOpen={isModalOpen}
            onClose={closeModal}
        >
            <FormRenderer
                schema={schema}
                FormTemplate={customFormTemplate ? customFormTemplate : (props) => (
                    <FormTemplate
                        {...props}
                        submitLabel={submitLabel}
                        disableSubmit={['invalid']}
                        buttonsProps={{
                            submit: { variant }
                        }}
                    />
                )}
                initialValues={initialValues}
                componentMapper={additionalMappers
                    ? { ...additionalMappers, ...componentMapper }
                    : componentMapper}
                //reload comes from the table and fetches fresh data
                onSubmit={async (values) => {
                    await onSubmit(values);
                    setTimeout(async () => await reloadData(), 500);
                    closeModal();
                }}
                onCancel={() => closeModal()}
                subscription={{ values: true }}
            />
        </Modal>
    );
};

RepoModal.propTypes = {
    isModalOpen: PropTypes.bool,
    title: PropTypes.string,
    closeModal: PropTypes.func,
    reloadData: PropTypes.func,
    submitLabel: PropTypes.string,
    schema: PropTypes.object,
    initialValues: PropTypes.object,
    variant: PropTypes.string,
    onSubmit: PropTypes.func,
    size: PropTypes.string,
    additionalMappers: PropTypes.object,
    titleIconVariant: PropTypes.any,
    customFormTemplate: PropTypes.node
};

export default RepoModal;
