const ImageColumn = {
  title: 'Image name',
  colSpan: 8,
  ref: 'image',
};

const HashCommitsColumn = {
  title: 'Hash commits',
  colSpan: 2,
  ref: 'hashCommitCount',
};

const SystemsColumn = {
  title: 'Systems',
  colSpan: 2,
  ref: 'systemCount',
  classname: 'ins-c-inventory__bootc-systems-count-cell',
};

const HashCommitColumn = {
  title: 'Hash commit',
  colSpan: 2,
  ref: 'image_digest',
};

const HashSystemColumn = {
  title: '',
  colSpan: 10,
  ref: 'hashSystemCount',
  classname: 'ins-c-inventory__bootc-systems-count-cell',
};

export const imageTableColumns = [
  ImageColumn,
  HashCommitsColumn,
  SystemsColumn,
];

export const hashTableColumns = [HashCommitColumn, HashSystemColumn];
