import CentosLinuxRegContent from './CentosLinuxRegContent';
import RHEL8RegContent from './RHEL8RegContent';
import RHEL7RegContent from './RHEL7RegContent';
import RHEL9RegContent from './RHEL9RegContent';
import {
  centosRadio,
  rhel7Radio,
  rhel8Radio,
  rhel9Radio,
} from '../../constants';

export const operatingSystemList = [
  {
    id: centosRadio,
    name: 'CentOS Linux 7',
    content: CentosLinuxRegContent,
  },
  {
    id: rhel7Radio,
    name: 'RHEL 7',
    content: RHEL7RegContent,
  },
  {
    id: rhel8Radio,
    name: 'RHEL 8',
    content: RHEL8RegContent,
  },
  {
    id: rhel9Radio,
    name: 'RHEL 9 or later',
    content: RHEL9RegContent,
  },
];
