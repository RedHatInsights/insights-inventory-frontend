import {
  EXPORT_SERVICE_APPLICATON,
  EXPORT_SERVICE_RESOURCE,
} from './constants';

export const buildExportRequestJson = (filters, format) => ({
  name: 'inventory-export',
  format,
  sources: [
    {
      application: EXPORT_SERVICE_APPLICATON,
      resource: EXPORT_SERVICE_RESOURCE,
      filters,
    },
  ],
});

// TODO Extend the function in fec to allow downloading a link and not just a blob and replace this.
export const downloadFile = async (
  url,
  { filename = `${new Date().toISOString()}`, format } = {}
) => {
  await fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename + '.' + format;
      link.click();
    })
    .catch(console.error);
};
