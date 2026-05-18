import type { ReactNode } from 'react';

/** Cypress stub for federated module loader (see config/setupTests.js). */
type ScalprumComponentProps = {
  children?: ReactNode;
};

export function ScalprumComponent({ children }: ScalprumComponentProps) {
  return children ?? null;
}
