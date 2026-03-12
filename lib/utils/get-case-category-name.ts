export const getCaseCategoryName = (category: string) => {
  switch (category) {
    case 'satire':
      return 'Satire';
    case 'report':
      return 'Bericht';
    case 'text_message':
      return 'Textnachricht';
    case 'opinion':
      return 'Meinung';
    default:
      return category;
  }
};
