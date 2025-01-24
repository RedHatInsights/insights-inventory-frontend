import '@patternfly/patternfly/patternfly.scss';
import '@cypress/code-coverage/support';
import './commands';

import chrome from '../../config/overrideChrome';

// eslint-disable-next-line rulesdir/no-chrome-api-call-from-window
window.insights = { chrome };
