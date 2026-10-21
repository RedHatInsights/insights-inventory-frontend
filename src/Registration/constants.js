import React from 'react';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/Skeleton';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

export const regAssistantDescriptionInsights =
  'The Insights for RHEL registration assistant will guide you through the setup process for the Red Hat Insights client.';

export const regAssistantDescriptionLightspeed =
  'The Red Hat Lightspeed registration assistant will guide you through the setup process.';

export const dataCollectionInsights =
  "Learn more about Red Hat Insights' data collection and controls";

export const dataCollectionLightspeed =
  "Learn more about Red Hat Lightspeed's data collection and controls";

export const usingProxyInsights =
  'Red Hat Insights proxy - learn how to connect to Red Hat Insights using a proxy';

export const usingProxyLightspeed =
  'Red Hat Lightspeed proxy - learn how to connect to Red Hat Lightspeed using a proxy';

export const usingSatelliteInsights =
  'Red Hat Satellite - learn how to connect systems to Red Hat Insights at scale with Red Hat Satellite';

export const usingSatelliteLightspeed =
  'Red Hat Satellite - learn how to connect systems to Red Hat Lightspeed at scale with Red Hat Satellite';

export const automateWithSatelliteInsights =
  'Looking for ways to automate Insights registration with Satellite? Read the following article:';

export const automateWithSatelliteLightspeed =
  'Looking for ways to automate Red Hat Lightspeed registration with Satellite? Read the following article:';

export const contentRunCommands =
  'Run the following commands in the terminal of your RHEL system with root privileges';

export const centosRegisterInsights =
  'Registering CentOS Linux 7 to Insights is only supported for the conversion of CentOS Linux 7 to Red Hat Enterprise Linux using Red Hat Insights.';

export const centosRegisterLightspeed =
  'Registering CentOS Linux 7 to Red Hat Lightspeed is only supported for the conversion of CentOS Linux 7 to Red Hat Enterprise Linux using Red Hat Lightspeed.';

export const connectToInsights = 'Connect to Insights.';

export const connectToLightspeed = 'Connect to Red Hat Lightspeed.';

export const dataCollectionLink =
  'https://www.redhat.com/en/technologies/management/insights/data-application-security#section-data-collection';

export const usingProxyLink =
  'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/connecting_your_rhel_systems_through_the_red_hat_lightspeed_proxy/index';

export const usingSatelliteLink =
  'https://docs.redhat.com/en/documentation/red_hat_satellite/6.16/html/managing_hosts/monitoring-hosts-by-using-red-hat-insights#configuring_synchronization_of_insights_recommendations_for_hosts_managing-hosts';

export const remoteHostConfigLink =
  'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/remote_host_configuration_and_management/index';

export const monitoringHostsLink =
  'https://docs.redhat.com/en/documentation/red_hat_satellite/6.14/html/managing_hosts/Monitoring_Hosts_Using_Red_Hat_Insights_managing-hosts#deploying-red-hat-insights-using-the-ansible-role_managing-hosts';

export const convertLinuxToRHEL =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/8/html/converting_from_a_linux_distribution_to_rhel_using_the_convert2rhel_utility/converting-using-lightspeed_converting-from-a-linux-distribution-to-rhel#converting-using-lightspeed_converting-from-a-linux-distribution-to-rhel';

export const rhel7LifecycleSupport =
  'https://access.redhat.com/support/policy/updates/rhel7-els-support-maintenance-policy';

export const insightsClientRegister = 'insights-client --register';

export const yumInstallInsightsClient = 'yum install insights-client';

export const centosInstallRHC = `curl -o /etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release https://security.access.redhat.com/data/fd431d51.txt

curl -o /etc/yum.repos.d/client-tools-for-rhel-7-server.repo https://cdn-public.redhat.com/content/public/repofiles/client-tools-for-rhel-7-server.repo

yum install -y subscription-manager subscription-manager-rhsm-certificates insights-client rhc rhc-worker-script`;

export const rhcConnect = (activationKey, orgId) => {
  return `rhc connect --activation-key ${activationKey.name} --organization ${orgId}`;
};

export const installWorkerPlaybook = 'dnf install -y rhc-worker-playbook';

export const subManagerRegister = (activationKey, orgId) => {
  return `subscription-manager register --activationkey ${activationKey.name} --org ${orgId}`;
};

export const loadingActivationKeys = [
  {
    name: <Skeleton size={SkeletonSize.sm} />,
  },
  {
    name: <Skeleton size={SkeletonSize.sm} />,
  },
  {
    name: <Skeleton size={SkeletonSize.sm} />,
  },
  {
    name: <Skeleton size={SkeletonSize.sm} />,
  },
  {
    name: <Skeleton size={SkeletonSize.sm} />,
  },
];

export const emptyActivationKeys = [
  {
    name: (
      <EmptyState icon={PlusCircleIcon} variant={EmptyStateVariant.xs}>
        <EmptyStateBody>No activation keys yet</EmptyStateBody>
      </EmptyState>
    ),
    isDisabled: true,
  },
];

export const centosRadio = 'centos-radio';
export const rhel7Radio = 'rhel7-radio';
export const rhel8Radio = 'rhel8-radio';
export const rhel9Radio = 'rhel9-radio';
