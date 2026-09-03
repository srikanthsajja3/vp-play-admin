const MAPPING_KEY = 'vrplay_category_class_map';

export const getCategoryClassMap = () => {
  try {
    const saved = localStorage.getItem(MAPPING_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading class map', e);
  }
  return {};
};

export const setCategoryClass = (categoryId, classId) => {
  const map = getCategoryClassMap();
  map[String(categoryId)] = String(classId);
  try {
    localStorage.setItem(MAPPING_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving class map', e);
  }
};
