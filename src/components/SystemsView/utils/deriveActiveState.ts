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
  isLoading || isFetching || data == null
    ? 'loading'
    : isError
      ? 'error'
      : data.length === 0
        ? 'empty'
        : 'active';
