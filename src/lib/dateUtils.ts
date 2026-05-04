export const getWeekKey = () => {
  const d = new Date();
  // Adjust to Monday of the current week
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return `w_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
};
