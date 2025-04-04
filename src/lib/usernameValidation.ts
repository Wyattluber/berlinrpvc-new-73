
// List of forbidden words for usernames
const forbiddenWords = [
  "admin",
  "administrator",
  "mod",
  "moderator",
  "support",
  "system",
  "staff",
  "official",
  // Common offensive words
  "arsch",
  "idiot",
  "dumm",
  "scheiße",
  // Add more forbidden words as needed
];

/**
 * Validates if a username is allowed
 * @param username Username to validate
 * @returns Object with validation result
 */
export function validateUsername(username: string): { valid: boolean; reason?: string } {
  // Check if username is empty
  if (!username.trim()) {
    return { valid: false, reason: "Benutzername darf nicht leer sein" };
  }
  
  // Check minimum length
  if (username.length < 3) {
    return { valid: false, reason: "Benutzername muss mindestens 3 Zeichen haben" };
  }
  
  // Check maximum length
  if (username.length > 20) {
    return { valid: false, reason: "Benutzername darf nicht länger als 20 Zeichen sein" };
  }
  
  // Convert to lowercase for case-insensitive matching
  const lowercaseUsername = username.toLowerCase();
  
  // Check for forbidden words
  for (const word of forbiddenWords) {
    if (lowercaseUsername.includes(word.toLowerCase())) {
      return { valid: false, reason: `Benutzername enthält ein nicht erlaubtes Wort: '${word}'` };
    }
  }
  
  // Check for valid characters (letters, numbers, underscores, hyphens)
  if (!/^[a-zA-Z0-9_\-]+$/.test(username)) {
    return { valid: false, reason: "Benutzername darf nur Buchstaben, Zahlen, Unterstriche und Bindestriche enthalten" };
  }
  
  return { valid: true };
}

/**
 * Checks if enough time has passed since last username change
 * @param lastChanged Date of last username change
 * @returns Object with information about cooldown
 */
export function checkUsernameCooldown(lastChanged: Date | null): { 
  canChange: boolean; 
  daysRemaining: number;
  nextChangeDate: Date | null;
} {
  // If user has never changed username, allow changing
  if (!lastChanged) {
    return { canChange: true, daysRemaining: 0, nextChangeDate: null };
  }
  
  const now = new Date();
  const cooldownDays = 30;
  const nextChangeDate = new Date(lastChanged);
  nextChangeDate.setDate(nextChangeDate.getDate() + cooldownDays);
  
  // If cooldown period has passed, allow changing
  if (now >= nextChangeDate) {
    return { canChange: true, daysRemaining: 0, nextChangeDate: null };
  }
  
  // Calculate days remaining in cooldown
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.ceil((nextChangeDate.getTime() - now.getTime()) / msPerDay);
  
  return { canChange: false, daysRemaining, nextChangeDate };
}

/**
 * Generate greeting based on time of day
 * @returns Appropriate greeting for the time of day
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Guten Morgen";
  } else if (hour >= 12 && hour < 18) {
    return "Guten Tag";
  } else if (hour >= 18 && hour < 22) {
    return "Guten Abend";
  } else {
    return "Gute Nacht";
  }
}
