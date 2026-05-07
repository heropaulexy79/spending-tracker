export const getWeekKey = () => {
  const d = new Date();
  // Adjust to Monday of the current week
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return `w_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
};

export const formatDate = (dateValue: any) => {
  if (!dateValue) return "Invalid Date";
  
  // Handle Firestore Timestamp
  if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
    return new Date(dateValue.seconds * 1000).toLocaleDateString("en-US", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  // Handle strings or Date objects
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "Invalid Date";
  
  return d.toLocaleDateString("en-US", {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
