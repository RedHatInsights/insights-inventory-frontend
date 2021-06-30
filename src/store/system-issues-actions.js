import { SYSTEM_ISSUE_TYPES } from './action-types';
import {
    cves,
    compliance,
    advisor,
    patch
} from '../api';

export const getAdvisorData = (systemId) => ({
    type: SYSTEM_ISSUE_TYPES.LOAD_ADVISOR_RECOMMENDATIONS,
    payload: advisor(systemId)
});

export const getVulnData = (systemId) => ({
    type: SYSTEM_ISSUE_TYPES.LOAD_APPLICABLE_CVES,
    payload: cves(systemId)
});

export const getPatchData = (systemId) => ({
    type: SYSTEM_ISSUE_TYPES.LOAD_APPLICABLE_ADVISORIES,
    payload: patch(systemId)
});

export const getComplianceData = (systemId) => ({
    type: SYSTEM_ISSUE_TYPES.LOAD_COMPLIANCE_POLICIES,
    payload: compliance(systemId)
});
