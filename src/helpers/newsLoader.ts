
import { supabase } from '@/integrations/supabase/client';

// First, declare the global function type
declare global {
  interface Window {
    loadNewsIntoProfile: () => Promise<void>;
  }
}

// Then, implement and export the function
export const loadNewsIntoProfile = async () => {
  const newsFeedContainer = document.getElementById('profile-news-feed');
  if (!newsFeedContainer) {
    console.warn('News feed container not found in the DOM');
    return;
  }
  
  try {
    // Show loading indicator
    newsFeedContainer.innerHTML = `
      <div class="text-center py-4">
        <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
        <p class="mt-2 text-sm text-gray-500">Neuigkeiten werden geladen...</p>
      </div>
    `;
    
    // Get latest news
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (newsError) throw newsError;

    // Get latest announcements
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(2);
    
    if (announcementsError) throw announcementsError;

    // Combine and sort both types of content
    const combinedContent = [
      ...(news || []).map(item => ({ ...item, type: 'news' })),
      ...(announcements || []).map(item => ({ ...item, type: 'announcement' }))
    ].sort((a, b) => {
      const dateA = new Date(a.type === 'news' ? a.created_at : a.published_at);
      const dateB = new Date(b.type === 'news' ? b.created_at : b.published_at);
      return dateB.getTime() - dateA.getTime();
    }).slice(0, 5); // Limit to 5 items total
    
    if (combinedContent.length === 0) {
      newsFeedContainer.innerHTML = `
        <div class="text-center py-6">
          <p class="text-gray-500">Keine Neuigkeiten vorhanden.</p>
        </div>
      `;
      return;
    }
    
    // Clear loading indicator
    newsFeedContainer.innerHTML = '';
    
    // Add news and announcement items
    combinedContent.forEach(item => {
      const date = new Date(item.type === 'news' ? item.created_at : item.published_at).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      const isAnnouncement = item.type === 'announcement';
      const itemElement = document.createElement('div');
      itemElement.className = `p-4 border rounded-md mb-4 ${isAnnouncement ? 'bg-blue-50 border-blue-100' : 'bg-white'} shadow-sm`;
      itemElement.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold ${isAnnouncement ? 'text-blue-700' : ''}">${isAnnouncement ? '📢 ' : ''}${item.title}</h3>
          <span class="text-xs text-gray-500">${date}</span>
        </div>
        <p class="text-sm text-gray-700">${item.content}</p>
      `;
      
      newsFeedContainer.appendChild(itemElement);
    });
  } catch (error) {
    console.error('Error loading news and announcements:', error);
    
    if (newsFeedContainer) {
      newsFeedContainer.innerHTML = `
        <div class="text-center py-4">
          <p class="text-red-500">Fehler beim Laden der Neuigkeiten.</p>
          <button 
            class="mt-2 text-sm text-blue-600 hover:underline"
            onclick="window.loadNewsIntoProfile()"
          >
            Erneut versuchen
          </button>
        </div>
      `;
    }
  }
};

// Also assign to window object for global access
if (typeof window !== 'undefined') {
  window.loadNewsIntoProfile = loadNewsIntoProfile;
}
