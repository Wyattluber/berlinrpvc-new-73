
import { supabase } from '@/integrations/supabase/client';

interface ApplicationTexts {
  id: string;
  team_description: string;
  partnership_description: string;
  requirements_description: string;
  updated_at: string;
}

/**
 * Get application description texts
 */
export async function getApplicationTexts(): Promise<ApplicationTexts | null> {
  try {
    const { data, error } = await supabase
      .from('application_texts')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching application texts:', error);
    return null;
  }
}

/**
 * Update application description texts
 */
export async function updateApplicationTexts(
  texts: {
    team_description?: string;
    partnership_description?: string;
    requirements_description?: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if any records exist
    const { data: existingData, error: checkError } = await supabase
      .from('application_texts')
      .select('id')
      .limit(1);
    
    if (checkError) throw checkError;
    
    let result;
    
    if (existingData && existingData.length > 0) {
      // Update existing record
      result = await supabase
        .from('application_texts')
        .update(texts)
        .eq('id', existingData[0].id);
    } else {
      // Insert new record
      result = await supabase
        .from('application_texts')
        .insert([texts]);
    }
    
    if (result.error) throw result.error;
    
    return {
      success: true,
      message: 'Bewerbungstexte erfolgreich aktualisiert'
    };
  } catch (error: any) {
    console.error('Error updating application texts:', error);
    return {
      success: false,
      message: error.message || 'Fehler beim Aktualisieren der Bewerbungstexte'
    };
  }
}

// Default application text for team description
export const DEFAULT_TEAM_DESCRIPTION = `
📌 Teamkleidung
👕 Die Teamkleidung kostet 10 Robux pro Stück und wird nicht gestellt.
💰 Falls neue Kleidung erscheint, gibt es eine teilweise Erstattung.

Aktueller Stand:
👕 Shirt – Wird am 22.03.25 im Team vorgestellt.
👖 Optionale Hose – Noch nicht kaufbar.

📌 Teammeetings
📅 Wann? Jeden Samstag um 19:00 Uhr in der Teamstage.
📢 Hier besprechen die Admins wichtige Neuerungen und Änderungen.
📝 Ob das Meeting stattfindet, siehst du in den Discord-Events.
⚠ Wichtig: Wenn du dich nicht abmeldest und unentschuldigt fehlst, erhältst du einen Warn.

📌 Warnsystem für Teammitglieder
🔹 Warns sind nur für Teammitglieder & Admins einsehbar.
🔹 Nach drei Warns wirst du geloggt.
🔹 Beim vierten Warn: Verlust der Teamrolle & in der Regel ein Bann von allen Plattformen.
🔹 Schwerwiegendes Fehlverhalten kann zu einer direkten Sperre ohne vorherige Warnstufen führen.

📌 Online-Präsenz bei Serverstart
Wenn der Server online geht, solltest du sofort beitreten, um die Sichtbarkeit in der öffentlichen Serverliste zu verbessern.
📌 Tickets & Voicechat-Support
🎫 Tickets & Voicechat-Support können nur von Teammitgliedern mit der „Ticket Support"-Rolle bearbeitet werden.
👥 Diese Rolle erhältst du, wenn du Interesse zeigst und deine Aktivität von den zuständigen Leitern als geeignet bewertet wird.

📌 Feedback & Verbesserungsvorschläge
💡 Deine Ideen sind gefragt! Feedback hilft uns, das Spielerlebnis und die Teamstruktur stetig zu verbessern.

📌 Moderator-Aufgaben
🔹 Löse Ingame-Probleme & schlichte Konflikte.
🔹 Missbrauch von Mod-Rechten führt zur sofortigen Degradierung.
🔹 Schwere Regelverstöße können zu einem sofortigen Bann führen – ohne vorherige Warnstufen.
`;

// Default application text for partnership description
export const DEFAULT_PARTNERSHIP_DESCRIPTION = `
Eine Partnerschaft mit BerlinRP-VC bietet dir die Möglichkeit, deine Community zu erweitern und von unserer aktiven Nutzerbasis zu profitieren.

📌 Vorteile einer Partnerschaft
🔹 Gegenseitige Werbung in den Discord-Servern
🔹 Erwähnung auf unserer Partner-Seite
🔹 Mögliche gemeinsame Events und Aktionen

📌 Voraussetzungen für eine Partnerschaft
🔹 Ein aktiver Discord-Server mit mindestens 100 Mitgliedern
🔹 Ein thematisch passendes Konzept zu Roleplay oder Gaming
🔹 Einhaltung der Discord Community-Richtlinien

Wir freuen uns auf deine Anfrage!
`;

// Default application text for requirements description
export const DEFAULT_REQUIREMENTS_DESCRIPTION = `
📌 Allgemeine Anforderungen

🔹 Mindestalter: 12 Jahre
🔹 Gute Deutschkenntnisse in Wort und Schrift
🔹 Aktives Discord- und Roblox-Konto
🔹 Verständnis und Einhaltung der Serverregeln
🔹 Zeitliche Verfügbarkeit für Teammeetings (samstags 19:00 Uhr)
🔹 Bereitschaft zur aktiven Mitarbeit
🔹 Teamfähigkeit und respektvoller Umgang
🔹 Keine Vorstrafen auf dem Server
`;
