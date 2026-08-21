export type SystemsViewActiveState = 'loading' | 'error' | 'empty' | 'active';

interface DeriveActiveStateParams {
  data: { length: number } | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

export const deriveActiveState = ({
  data,
  isLoading,
  isFetching,
  isError,
}: DeriveActiveStateParams): SystemsViewActiveState =>
  isError
    ? 'error'
    : isLoading || isFetching || data == null
      ? 'loading'
      : data.length === 0
        ? 'empty'
        : 'active';
