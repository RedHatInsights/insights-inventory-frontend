import React from 'react';
import type { Column } from '../types';
import { bindColumn } from '../bindColumn';
import type { InventoryBindableItem } from './columnDefinitions';
import { TagKeyValues } from './cells/TagKeyValues';
import {
  tagColumnKey,
  tagIdentity,
  valuesForTagIdentity,
  type TagKeyIdentity,
} from '../../../InventoryViews/tagKeys';

const APP_NAME = 'inventory' as const;

export const bindTagKeyColumns = (
  identities: readonly TagKeyIdentity[],
): Column<InventoryBindableItem>[] =>
  identities.map(({ namespace, key }) => {
    const identity = tagIdentity(namespace, key);

    return bindColumn(
      {
        appName: APP_NAME,
        title: identity,
        key: tagColumnKey(identity),
        minWidth: '8rem',
        renderCell: (values: string[]) => (
          <TagKeyValues identity={identity} values={values} />
        ),
      },
      {
        isShownByDefault: false,
        getValue: (item) =>
          valuesForTagIdentity(item.tagsByKey, item.tags, identity),
      },
    );
  });
