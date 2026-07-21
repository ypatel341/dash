export const formatYYYYMMDDToDDMMYYYY = (yyyymmdd: string): string => {
  const [year, month, day] = yyyymmdd.split('-');
  return `${day}/${month}/${year}`;
};
