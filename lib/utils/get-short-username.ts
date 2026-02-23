// function to recive the first letter of the username
export function getShortUsername(username: string): string {
  if (!username) return '';
  return username.charAt(0).toUpperCase();
}
