import React from 'react';
import { Tooltip } from '@patternfly/react-core';
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

const APP_NAME = 'tag' as const;

export const bindTagKeyColumns = (
  identities: readonly TagKeyIdentity[],
): Column<InventoryBindableItem>[] =>
  identities.map(({ namespace, key }) => {
    const identity = tagIdentity(namespace, key);

    return {
      ...bindColumn(
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
      ),
      isRemovable: true,
      // Manage columns keeps namespace/key via `title`. The table shows the key.
      tableHeader: namespace ? (
        <Tooltip content={identity}>
          <span>{key}</span>
        </Tooltip>
      ) : undefined,
    };
  });
