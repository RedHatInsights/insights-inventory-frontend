import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import React from 'react';
import type { System } from '../InventoryViews/hostsQueryOptions';
import { AllTagsModal } from './TagsModal/AllTagsModal';
import { SingleHostTagsModal } from './TagsModal/SingleHostTagsModal';

export interface OpenTagsModalOptions {
  initialTagSearch?: string;
}

export type OpenTagsModalFn = (
  systems: System[],
  options?: OpenTagsModalOptions,
) => void;

interface TagsModalContextValue {
  openTagsModal: OpenTagsModalFn;
}

const TagsModalContext = createContext<TagsModalContextValue | null>(null);

/** Exported for tests that need to wrap with a provider */
export { TagsModalContext };

export const useTagsModalContext = () => {
  const context = useContext(TagsModalContext);
  if (!context) {
    throw new Error(
      'hook useTagsModalContext must be used within TagsModalProvider',
    );
  }
  return context;
};

interface TagsModalProviderProps {
  children: React.ReactNode;
}

export const TagsModalProvider = ({ children }: TagsModalProviderProps) => {
  const [systemsForTags, setSystemsForTags] = useState<System[]>([]);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [tagsModalInitialSearch, setTagsModalInitialSearch] = useState('');

  const closeTagsModal = useCallback(() => {
    setTagsModalInitialSearch('');
    setTagsModalOpen(false);
  }, []);

  const openTagsModal = useCallback<OpenTagsModalFn>((systems, options) => {
    setSystemsForTags(systems);
    setTagsModalInitialSearch(options?.initialTagSearch ?? '');
    setTagsModalOpen(true);
  }, []);

  const contextValue: TagsModalContextValue = useMemo(
    () => ({
      openTagsModal,
    }),
    [openTagsModal],
  );

  return (
    <TagsModalContext.Provider value={contextValue}>
      {children}
      {tagsModalOpen &&
        (systemsForTags.length === 0 ? (
          <AllTagsModal
            isOpen={tagsModalOpen}
            initialTagSearch={tagsModalInitialSearch}
            onClose={closeTagsModal}
          />
        ) : (
          <SingleHostTagsModal
            isOpen={tagsModalOpen}
            system={systemsForTags[0]!}
            onClose={closeTagsModal}
          />
        ))}
    </TagsModalContext.Provider>
  );
};
