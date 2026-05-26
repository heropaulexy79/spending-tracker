export const getWeekKey = () => {
  const d = new Date();
  // Adjust to Monday of the current week
  const day = d.getDay() === 0 ? 7 : d.getDay();
  const dCopy = new Date(d);
  dCopy.setDate(d.getDate() - day + 1);
  dCopy.setHours(0, 0, 0, 0);
  return `w_${dCopy.getFullYear()}_${dCopy.getMonth() + 1}_${dCopy.getDate()}`;
};

export const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export const getMonthKey = () => {
  const d = new Date();
  return `m_${d.getFullYear()}_${d.getMonth() + 1}`;
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
