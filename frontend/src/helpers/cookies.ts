/**
 * Retrieves the value of a cookie by name.
 * @param name - The name of the cookie to retrieve.
 * @returns The cookie value as a string, or an empty string if not found.
 */
export default function getCookie(name: string): string {
  const cookieValue = document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="))
    ?.split("=")[1];
  return cookieValue || "";
}