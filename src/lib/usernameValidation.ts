import { supabase } from '@/integrations/supabase/client';

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
export async function validateUsername(username: string): Promise<{ valid: boolean; reason?: string }> {
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
  
  // Check for valid characters (letters, numbers, underscores, hyphens)
  if (!/^[a-zA-Z0-9_\-]+$/.test(username)) {
    return { valid: false, reason: "Benutzername darf nur Buchstaben, Zahlen, Unterstriche und Bindestriche enthalten" };
  }
  
  // Check against blacklist from database
  try {
    const lowercaseUsername = username.toLowerCase();
    const { data: blacklistedWords, error } = await supabase
      .from('username_blacklist')
      .select('word');
      
    if (error) {
      console.error('Error checking blacklist:', error);
      // Continue with other validations if blacklist check fails
    } else if (blacklistedWords) {
      for (const item of blacklistedWords) {
        if (lowercaseUsername.includes(item.word.toLowerCase())) {
          return { valid: false, reason: `Benutzername enthält ein nicht erlaubtes Wort: '${item.word}'` };
        }
      }
    }
  } catch (error) {
    console.error('Error checking blacklist:', error);
    // Continue with other validations if blacklist check fails
  }
  
  return { valid: true };
}

/**
 * Checks if a username is already taken
 * @param username Username to check
 * @returns Promise with result of check
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking username:', error);
      throw new Error('Fehler beim Überprüfen des Benutzernamens');
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking username:', error);
    throw new Error('Fehler beim Überprüfen des Benutzernamens');
  }
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

/**
 * Check if the user can set admin username
 * @param userId User ID to check
 * @returns Promise with result of check
 */
export async function canUseAdminUsername(userId: string): Promise<boolean> {
  try {
    const { checkIsAdmin } = await import('@/lib/admin');
    return await checkIsAdmin();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Extracts clean username from Discord display name
 * Removes the #0000 format or any discriminator at the end
 * @param discordName The full Discord display name
 * @returns Clean username without discriminator
 */
export function cleanDiscordUsername(discordName: string): string {
  // Remove any #XXXX discriminator format (old Discord format)
  if (discordName.includes('#')) {
    return discordName.split('#')[0];
  }
  
  // For new Discord usernames that don't have the #0000 format
  return discordName;
}
