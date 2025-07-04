function timeAgo(isoDateString) {
  const now = new Date();
  const past = new Date(isoDateString);
  const diff = Math.floor((now - past) / 1000); // difference in seconds

  if (diff < 60) return `${diff} seconds ago`;
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(days / 365);
  return `${years} years ago`;
}

export { timeAgo };
