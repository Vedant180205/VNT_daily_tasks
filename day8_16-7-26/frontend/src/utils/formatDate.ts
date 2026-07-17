export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  
  // Check if date is invalid
  if (isNaN(date.getTime())) return "N/A";
  
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}
