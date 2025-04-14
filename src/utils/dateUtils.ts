export const formatTimestampForMySQL = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid timestamp format");
  }
  return date.toISOString().slice(0, 19).replace("T", " ");
};
