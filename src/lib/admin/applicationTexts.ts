
import { supabase } from '@/integrations/supabase/client';

export const DEFAULT_TEAM_DESCRIPTION = `📌 Teamkleidung
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
🔹 Schwere Regelverstöße können zu einem sofortigen Bann führen – ohne vorherige Warnstufen.`;

export const DEFAULT_PARTNERSHIP_DESCRIPTION = `Als Partner von BerlinRPVC profitierst du von:

📢 Werbung und Reichweite: Dein Server wird auf unserer Website beworben und in unseren Discord-Servern vorgestellt.

🤝 Gegenseitiger Unterstützung: Wir helfen uns gegenseitig bei Events und Projekten.

🌐 Vernetzung: Werde Teil eines Netzwerks von gleichgesinnten Communities und Servern.

🔄 Erfahrungsaustausch: Teile deine Erfahrungen und lerne von anderen Partnern.

Wir suchen Partner, die:

✅ Eine aktive Community haben
✅ Ähnliche Werte und Interessen teilen
✅ Bereit sind, sich gegenseitig zu unterstützen
✅ Mindestens 50 aktive Mitglieder haben

Fülle das Formular aus und wir melden uns bei dir!`;

export const DEFAULT_REQUIREMENTS_DESCRIPTION = `Um dich als Teammitglied zu bewerben, solltest du folgende Voraussetzungen erfüllen:

⏱️ Mindestalter: 12 Jahre
⏱️ Mindestens 2 Stunden Zeit pro Woche für den Server
⏱️ Teilnahme an den wöchentlichen Team-Meetings (Samstags 19 Uhr)

💬 Gute Kommunikationsfähigkeiten
💬 Freundlicher und respektvoller Umgang mit Spielern
💬 Bereitschaft, Konflikte sachlich zu lösen

🔧 Grundlegende Kenntnisse von Roblox und dem BerlinRP-VC Server
🔧 Verstehen und Befolgen der Serverregeln
🔧 Bereitschaft, neue Fähigkeiten zu erlernen

🤝 Teamfähigkeit und Zuverlässigkeit
🤝 Verantwortungsbewusstsein
🤝 Motivation, den Server aktiv mitzugestalten`;

export type ApplicationTextsType = {
  id?: string;
  team_description: string;
  partnership_description: string;
  requirements_description: string;
  updated_at?: string;
};

export const getApplicationTexts = async (): Promise<ApplicationTextsType | null> => {
  try {
    // First, check if the table exists
    const { error: tableCheckError } = await supabase
      .from('application_texts')
      .select('id')
      .limit(1);
    
    if (tableCheckError && tableCheckError.code === '42P01') {
      // Table doesn't exist, create it and insert default values
      console.log('Application texts table does not exist. Creating it...');
      
      // Create the table
      const { error: createTableError } = await supabase.rpc('create_application_texts_table');
      
      if (createTableError) {
        console.error('Error creating application_texts table:', createTableError);
        
        // Return default values if we can't create the table
        return {
          team_description: DEFAULT_TEAM_DESCRIPTION,
          partnership_description: DEFAULT_PARTNERSHIP_DESCRIPTION,
          requirements_description: DEFAULT_REQUIREMENTS_DESCRIPTION
        };
      }
      
      // Insert default values
      await supabase
        .from('application_texts')
        .insert({
          team_description: DEFAULT_TEAM_DESCRIPTION,
          partnership_description: DEFAULT_PARTNERSHIP_DESCRIPTION,
          requirements_description: DEFAULT_REQUIREMENTS_DESCRIPTION
        });
        
      return {
        team_description: DEFAULT_TEAM_DESCRIPTION,
        partnership_description: DEFAULT_PARTNERSHIP_DESCRIPTION,
        requirements_description: DEFAULT_REQUIREMENTS_DESCRIPTION
      };
    }
    
    // If the table exists, get the texts
    const { data, error } = await supabase
      .from('application_texts')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      console.error('Error fetching application texts:', error);
      throw error;
    }
    
    return data || {
      team_description: DEFAULT_TEAM_DESCRIPTION,
      partnership_description: DEFAULT_PARTNERSHIP_DESCRIPTION,
      requirements_description: DEFAULT_REQUIREMENTS_DESCRIPTION
    };
  } catch (error) {
    console.error('Error fetching application texts:', error);
    // Return default values on error
    return {
      team_description: DEFAULT_TEAM_DESCRIPTION,
      partnership_description: DEFAULT_PARTNERSHIP_DESCRIPTION,
      requirements_description: DEFAULT_REQUIREMENTS_DESCRIPTION
    };
  }
};

export const updateApplicationTexts = async (texts: ApplicationTextsType): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if the table exists
    const { error: tableCheckError } = await supabase
      .from('application_texts')
      .select('id')
      .limit(1);
    
    if (tableCheckError && tableCheckError.code === '42P01') {
      // Table doesn't exist, create it
      const { error: createTableError } = await supabase.rpc('create_application_texts_table');
      
      if (createTableError) {
        console.error('Error creating application_texts table:', createTableError);
        throw new Error('Fehler beim Erstellen der Tabelle');
      }
      
      // Insert the new texts
      const { error: insertError } = await supabase
        .from('application_texts')
        .insert({
          team_description: texts.team_description,
          partnership_description: texts.partnership_description,
          requirements_description: texts.requirements_description
        });
        
      if (insertError) {
        console.error('Error inserting application texts:', insertError);
        throw new Error('Fehler beim Speichern der Texte');
      }
      
      return { success: true, message: 'Texte wurden erfolgreich gespeichert' };
    }
    
    // If we have existing texts, get the most recent one
    const { data: existingData, error: fetchError } = await supabase
      .from('application_texts')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing application texts:', fetchError);
      throw new Error('Fehler beim Abrufen der existierenden Texte');
    }
    
    if (existingData && existingData.id) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('application_texts')
        .update({
          team_description: texts.team_description,
          partnership_description: texts.partnership_description,
          requirements_description: texts.requirements_description,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);
        
      if (updateError) {
        console.error('Error updating application texts:', updateError);
        throw new Error('Fehler beim Aktualisieren der Texte');
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('application_texts')
        .insert({
          team_description: texts.team_description,
          partnership_description: texts.partnership_description,
          requirements_description: texts.requirements_description
        });
        
      if (insertError) {
        console.error('Error inserting application texts:', insertError);
        throw new Error('Fehler beim Speichern der Texte');
      }
    }
    
    return { success: true, message: 'Texte wurden erfolgreich gespeichert' };
  } catch (error) {
    console.error('Error in updateApplicationTexts:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten'
    };
  }
};
