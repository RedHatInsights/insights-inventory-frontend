import React, { type ReactNode } from 'react';

type MockAsyncComponentProps = {
  fallback?: ReactNode;
  ErrorComponent?: ReactNode;
  module?: string;
};

/**
 * Generic Cypress stub for federated AsyncComponent usages. Renders the caller's
 * fallback/ErrorComponent instead of module-specific UI (e.g. WorkspaceSelector).
 */
export default function MockAsyncComponent({
  fallback,
  ErrorComponent,
  module,
}: MockAsyncComponentProps) {
  return (
    <div data-testid="async-component-mock" data-module={module}>
      {fallback ?? ErrorComponent ?? null}
    </div>
  );
}
