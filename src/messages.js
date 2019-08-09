/* eslint-disable max-len */
import { defineMessages } from 'react-intl';

export default defineMessages({
    disableDailyUploads: {
        id: 'daily.uploads.disable',
        description: 'Text to disable daily uploads',
        defaultMessage: 'To disable the daily upload for {system, plural, one {this system} other {these systems}}, use the following command:'
    },
    systemRemoveInfo: {
        id: 'system.remove.info',
        description: 'Text to inform user about removal of system',
        defaultMessage: '{systemToRemove} {system, plural, one {} other {systems}} will be removed from all {host} applications and services. You need to re - register the {system, plural, one { system } other { systems }} to add it back to your inventory.'
    }
});
/* eslint-enable max-len */
