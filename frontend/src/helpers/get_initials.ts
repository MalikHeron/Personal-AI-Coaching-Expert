import type { User } from "@/types/user";

// Function to generate avatar initials
export function getInitials(user: User) {
  if (!user || !user.username) return "JD";

  // Split the username into words (assuming it's in "First Last" format)
  const nameParts = (user.first_name + ' ' + user.last_name).split(' ');

  // Get the first letter of the first and last name (or the first word in case of only one name part)
  const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "";
  const lastInitial = nameParts.length > 1 ? nameParts[1]?.charAt(0).toUpperCase() : "";

  return firstInitial + lastInitial || "JD";
};