// Shared constants for the application
export const FRONTEND_OPTIONS = [
  { id: 'site1', label: 'Química Industrial' },
  { id: 'site2', label: 'Frontend 2' },
  { id: 'site3', label: 'Frontend 3' },
  { id: 'site4', label: 'Frontend 4' },
  { id: 'site5', label: 'Frontend 5' }
];

export const SITE_LABELS = {
  site1: 'Sitio 1',
  site2: 'Sitio 2', 
  site3: 'Sitio 3',
  site4: 'Sitio 4',
  site5: 'Sitio 5'
};

export const PRESENTATION_TYPES = {
  SOLID: 'solido',
  LIQUID: 'liquido'
};

export const PRESENTATION_TYPE_LABELS = {
  [PRESENTATION_TYPES.SOLID]: 'Sólidas',
  [PRESENTATION_TYPES.LIQUID]: 'Líquidas'
};

// Helper function to map site-specific data to array indices
export const mapSiteDataToArray = (siteData) => {
  const array = Array(5).fill("");
  if (siteData) {
    Object.entries(siteData).forEach(([site, value]) => {
      const siteIndex = parseInt(site.replace('site', '')) - 1;
      if (siteIndex >= 0 && siteIndex < 5) {
        array[siteIndex] = value !== null && value !== undefined ? value : "";
      }
    });
  }
  return array;
};

// Helper function to map site-specific images to array
export const mapSiteImagesToArray = (siteImages) => {
  const array = Array(5).fill({ file: null, previewUrl: null });
  if (siteImages) {
    Object.entries(siteImages).forEach(([site, url]) => {
      const siteIndex = parseInt(site.replace('site', '')) - 1;
      if (siteIndex >= 0 && siteIndex < 5) {
        array[siteIndex] = { file: null, previewUrl: url || null };
      }
    });
  }
  return array;
};

// Helper function to get site label by ID
export const getSiteLabel = (siteId) => {
  return FRONTEND_OPTIONS.find(site => site.id === siteId)?.label || siteId;
};

// Helper function to get site index from site ID
export const getSiteIndex = (siteId) => {
  return parseInt(siteId.replace('site', '')) - 1;
};

// Helper function to get site ID from index
export const getSiteId = (index) => {
  return `site${index + 1}`;
};
