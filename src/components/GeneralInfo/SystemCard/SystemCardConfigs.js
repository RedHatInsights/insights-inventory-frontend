import React from 'react';
import { generalMapper, workloadsDataMapper } from '../dataMapper';
import { Icon, ModalVariant, Tooltip } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import {
  AnsibleWorkloadsContent,
  SatelliteWorkloadsContent,
} from './WorkloadsModalContent';

export const workloadConfigs = (handleClick, workloadsData, entity) => [
  {
    type: 'sap',
    title: 'SAP',
    onClick: () =>
      handleClick(
        'SAP IDs (SID)',
        generalMapper(workloadsData.sap.sids, 'SID'),
      ),
    target: 'sap_sids',
  },
  {
    type: 'ansible',
    title: 'Ansible Automation Platform',
    onClick: () =>
      handleClick(
        'Ansible Automation Platform',
        {
          content: (
            <AnsibleWorkloadsContent
              ansible={workloadsData.ansible}
              entity={entity}
            />
          ),
        },
        ModalVariant.medium,
      ),
    target: 'ansible',
  },
  {
    type: 'mssql',
    title: 'Microsoft SQL',
    onClick: () =>
      handleClick(
        'Microsoft SQL',
        workloadsDataMapper({
          data: [{ version: workloadsData.mssql.version }],
        }),
      ),
    target: 'mssql',
  },
  {
    type: 'crowdstrike',
    title: 'CrowdStrike',
    onClick: () =>
      handleClick(
        'CrowdStrike',
        workloadsDataMapper({
          data: [workloadsData.crowdstrike],
          fieldKeys: ['falcon_aid', 'falcon_backend', 'falcon_version'],
          columnTitles: ['Falcon AID', 'Falcon backend', 'Falcon version'],
        }),
      ),
    target: 'crowdstrike',
  },
  {
    type: 'rhel_ai',
    title: 'RHEL AI',
    onClick: () =>
      handleClick(
        'RHEL AI',
        workloadsDataMapper({
          data: [workloadsData.rhel_ai],
          fieldKeys: [
            'amd_gpu_models',
            'intel_gaudi_hpu_models',
            'nvidia_gpu_models',
            'rhel_ai_version_id',
            'variant',
          ],
          columnTitles: [
            'AMD GPU models',
            'Intel Gaudi HPU models',
            'Nvidia GPU models',
            'RHEL AI version ID',
            'Variant',
          ],
        }),
      ),
    target: 'rhel_ai',
  },
  {
    type: 'intersystems',
    title: 'InterSystems',
    onClick: () =>
      handleClick(
        'InterSystems',
        workloadsDataMapper({
          data: workloadsData.intersystems.running_instances,
          fieldKeys: ['instance_name', 'product', 'version'],
          columnTitles: ['Instance name', 'Product', 'Version'],
        }),
      ),
    target: 'intersystems',
  },
  {
    type: 'ibm_db2',
    customRender: () => {
      const isRunning = workloadsData?.ibm_db2?.is_running;
      return (
        <>
          <Icon status={isRunning ? 'success' : 'warning'}>
            <Tooltip content={isRunning ? 'Running' : 'Failed'}>
              {isRunning ? <CheckCircleIcon /> : <ExclamationTriangleIcon />}
            </Tooltip>
          </Icon>{' '}
          IBM Db2
        </>
      );
    },
  },
  {
    type: 'oracle_db',
    customRender: () => {
      const isRunning = workloadsData?.oracle_db?.is_running;
      return (
        <>
          <Icon status={isRunning ? 'success' : 'warning'}>
            <Tooltip content={isRunning ? 'Running' : 'Failed'}>
              {isRunning ? <CheckCircleIcon /> : <ExclamationTriangleIcon />}
            </Tooltip>
          </Icon>{' '}
          Oracle Database
        </>
      );
    },
  },
  {
    type: 'satellite',
    title: 'Satellite',
    onClick: () =>
      handleClick(
        'Satellite',
        {
          content: (
            <SatelliteWorkloadsContent
              satellite={workloadsData.satellite}
              entity={entity}
            />
          ),
        },
        ModalVariant.medium,
      ),
    target: 'satellite',
  },
];

export const workloadsTypesKeys = [
  'ansible',
  'crowdstrike',
  'ibm_db2',
  'intersystems',
  'mssql',
  'oracle_db',
  'rhel_ai',
  'sap',
  'satellite',
];
