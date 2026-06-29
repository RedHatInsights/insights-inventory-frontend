import { useEffect, useRef } from 'react';
import type { SetURLSearchParams } from 'react-router-dom';
import {
  applyDraftToSearchParams,
  hasFilterOrSortInUrl,
  hasPersistedTableState,
  readInventoryTableDraft,
} from '../utils/inventoryTableDraftStorage';

interface UseBootstrapInventoryTableDraftParams {
  orgId: string | undefined;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  onReady: () => void;
}

export const useBootstrapInventoryTableDraft = ({
  orgId,
  searchParams,
  setSearchParams,
  onReady,
}: UseBootstrapInventoryTableDraftParams) => {
  const bootstrapPhaseRef = useRef<'idle' | 'done'>('idle');

  useEffect(() => {
    if (orgId === undefined) {
      return;
    }

    if (bootstrapPhaseRef.current === 'done') {
      return;
    }

    if (!hasFilterOrSortInUrl(searchParams)) {
      const draft = readInventoryTableDraft(orgId);
      if (draft && hasPersistedTableState(draft)) {
        setSearchParams(applyDraftToSearchParams(searchParams, draft), {
          replace: true,
        });
        // Call onReady asynchronously to allow URL update to complete
        setTimeout(() => {
          bootstrapPhaseRef.current = 'done';
          onReady();
        }, 0);
        return;
      }
    }

    bootstrapPhaseRef.current = 'done';
    onReady();
  }, [orgId, onReady, searchParams, setSearchParams]);
};
