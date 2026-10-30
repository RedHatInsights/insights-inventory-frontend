import { mergeColumns } from './mergeColumns';

const column = (key: string, isShown: boolean) => ({
  key,
  isShown,
  isShownByDefault: isShown,
  title: key,
});

describe('mergeColumns', () => {
  it('appends new columns and keeps existing visibility and order', () => {
    const current = [column('display_name', true), column('tags', false)];
    const incoming = [
      column('tags', true),
      column('display_name', false),
      column('tag:owner', false),
    ];

    expect(
      mergeColumns(current, incoming).map((col) => [col.key, col.isShown]),
    ).toEqual([
      ['display_name', true],
      ['tags', false],
      ['tag:owner', false],
    ]);
  });

  it('keeps a shown column that the next catalog omits', () => {
    const current = [column('display_name', true), column('tag:owner', true)];
    const incoming = [column('display_name', true)];

    expect(mergeColumns(current, incoming).map((col) => col.key)).toEqual([
      'display_name',
      'tag:owner',
    ]);
  });
});
