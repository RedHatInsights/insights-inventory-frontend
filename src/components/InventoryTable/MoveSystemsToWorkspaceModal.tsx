import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Form,
  FormGroup,
  FormGroupLabelHelp,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Popover,
  Spinner,
} from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { addHostListToGroup } from '../../api/hostInventoryApi';
import InfoTable from '../GeneralInfo/InfoTable/InfoTable';
import './MoveSystemsToWorkspaceModal.scss';

/** Minimal system shape used when moving systems to a workspace (group) */
export interface SystemForWorkspace {
  id: string;
  display_name?: string;
  groups?: { id: string; name: string }[];
}

export interface MoveSystemsToWorkspaceModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  modalState: SystemForWorkspace[] | SystemForWorkspace;
  reloadData: () => void | Promise<void>;
}

/**
 * Integrates the federated WorkspaceSelector from insights-rbac-ui (PR 2097).
 * The RBAC app exposes ./modules/WorkspaceSelector; the platform/chrome
 * must provide the "rbac" scope at runtime.
 *  @param root0
 *  @param root0.isModalOpen
 *  @param root0.setIsModalOpen
 *  @param root0.modalState
 *  @param root0.reloadData
 */
const MoveSystemsToWorkspaceModal = ({
  isModalOpen,
  setIsModalOpen,
  modalState,
  reloadData,
}: MoveSystemsToWorkspaceModalProps) => {
  const labelHelpRef = useRef<HTMLDivElement>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    workspace?: { id: string; name: string };
  } | null>(null);

  const addNotification = useAddNotification();

  const systems = Array.isArray(modalState)
    ? modalState
    : modalState != null
      ? [modalState]
      : [];

  const handleMove = async () => {
    if (!selectedWorkspace?.workspace?.id || !systems.length) return;
    const workspaceId = selectedWorkspace.workspace.id;
    const workspaceName = selectedWorkspace.workspace.name ?? workspaceId;
    const hostIds = systems.map((s) => s.id);
    try {
      await addHostListToGroup({ groupId: workspaceId, requestBody: hostIds });
      const workspaceDetailUrl = `/iam/user-access/workspaces/detail/${workspaceId}`;
      addNotification({
        variant: 'success',
        title:
          systems.length === 1
            ? `${systems[0].display_name ?? systems[0].id} has been moved successfully.`
            : 'Multiple systems have been moved successfully.',
        description: (
          <>
            <a href={workspaceDetailUrl}>View workspace</a>
          </>
        ),
      });
      void reloadData?.();
      setIsModalOpen(false);
      setSelectedWorkspace(null);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'Title' in err
          ? (err as { Title: string }).Title
          : `Failed to move system(s) to ${workspaceName}`;
      addNotification({
        variant: 'danger',
        title: 'Error',
        description: message,
      });
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedWorkspace(null);
  };

  const newWorkspaceName =
    selectedWorkspace?.workspace?.name ?? selectedWorkspace?.workspace?.id;
  const isSingleSystem = systems.length === 1;
  const uniqueCurrentWorkspaces = [
    ...new Set(
      systems
        .map((s) => s.groups?.[0]?.name)
        .filter((n): n is string => Boolean(n)),
    ),
  ];
  const fromWorkspaceText =
    uniqueCurrentWorkspaces.length === 1
      ? uniqueCurrentWorkspaces[0]
      : 'multiple workspaces';

  const isMultiSystem = systems.length > 1;

  const systemsTableCells = useMemo(
    () => [{ title: 'System name' }, { title: 'Current workspace' }],
    [],
  );
  const systemsTableRows = useMemo(() => {
    const sys = Array.isArray(modalState)
      ? modalState
      : modalState != null
        ? [modalState]
        : [];
    return sys.map((s: SystemForWorkspace) => [
      s.display_name ?? s.id,
      s.groups?.[0]?.name ?? '—',
    ]);
  }, [modalState]);

  return (
    <Modal
      className="move-systems-to-workspace-modal"
      maxWidth="800px"
      width="50%"
      isOpen={isModalOpen}
      onClose={handleClose}
    >
      <ModalHeader
        title={systems.length === 1 ? 'Move system' : 'Move systems'}
      />
      <ModalBody>
        <div style={{ marginBottom: '1rem' }}>
          Moving a system to a different workspace may change who is able to
          access it and their permissions. Make sure you review the differences
          between each workspace&#39;s user groups and roles before you click
          Move.
        </div>
        {isMultiSystem ? (
          <div
            style={{
              maxHeight: '40vh',
              overflow: 'auto',
              marginBottom: '1rem',
            }}
          >
            <InfoTable
              cells={systemsTableCells as never[]}
              rows={systemsTableRows as never[]}
              expandable={false}
              showPagination={false}
            />
          </div>
        ) : (
          <>
            <DescriptionList columnModifier={{ default: '2Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>System name</DescriptionListTerm>
                <DescriptionListDescription>
                  {systems.length > 0 &&
                    (systems[0].display_name ?? systems[0].id)}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Current workspace</DescriptionListTerm>
                <DescriptionListDescription>
                  {systems.length > 0
                    ? (systems[0].groups?.[0]?.name ?? '—')
                    : null}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
            <br />
          </>
        )}
        <Form>
          <FormGroup
            label="Destination workspace"
            labelHelp={
              <Popover
                triggerRef={labelHelpRef}
                bodyContent={
                  <div>
                    Moving systems will update their permissions to match access
                    controls of the destination workspace you select here.
                  </div>
                }
              >
                <FormGroupLabelHelp
                  ref={labelHelpRef}
                  aria-label="More info for workspace selector"
                />
              </Popover>
            }
            isRequired
            fieldId="simple-form-name-01"
          >
            <AsyncComponent
              scope="rbac"
              module="./modules/WorkspaceSelector"
              onSelect={(item: { workspace?: { id: string; name: string } }) =>
                setSelectedWorkspace(item)
              }
              menuWidth="500px"
              fallback={<Spinner size="lg" />}
            />
          </FormGroup>
        </Form>
        <br />
        {!selectedWorkspace?.workspace ? (
          <div>
            Don&#39;t see your workspace?{' '}
            <a href="/iam/user-access/workspaces/create-workspace">
              Create one here
            </a>
          </div>
        ) : (
          <Alert
            variant="info"
            title={
              isSingleSystem ? (
                <>
                  This action will move{' '}
                  <strong>{systems[0].display_name ?? systems[0].id}</strong>
                  from <strong>
                    {systems[0].groups?.[0]?.name ?? '—'}
                  </strong> to <strong>{newWorkspaceName}</strong>.
                </>
              ) : (
                <>
                  This action will move the listed systems from{' '}
                  <strong>{fromWorkspaceText}</strong> to{' '}
                  <strong>{newWorkspaceName}</strong>.
                </>
              )
            }
            ouiaId="MoveSystemsAlert"
          />
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleMove}
          isDisabled={!selectedWorkspace?.workspace?.id}
        >
          Move
        </Button>
        <Button variant="link" onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MoveSystemsToWorkspaceModal;
