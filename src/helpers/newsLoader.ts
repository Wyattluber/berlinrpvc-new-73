
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
  if (!newsFeedContainer) return;
  
  try {
    // Show loading indicator
    newsFeedContainer.innerHTML = `
      <div class="text-center py-4">
        <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
        <p class="mt-2 text-sm text-gray-500">Neuigkeiten werden geladen...</p>
      </div>
    `;
    
    // Get latest news
    const { data: news, error } = await supabase
      .from('news')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    if (!news || news.length === 0) {
      newsFeedContainer.innerHTML = `
        <div class="text-center py-6">
          <p class="text-gray-500">Keine Neuigkeiten vorhanden.</p>
        </div>
      `;
      return;
    }
    
    // Clear loading indicator
    newsFeedContainer.innerHTML = '';
    
    // Add news items
    news.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      const newsItem = document.createElement('div');
      newsItem.className = 'p-4 border rounded-md mb-4 bg-white shadow-sm';
      newsItem.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold">${item.title}</h3>
          <span class="text-xs text-gray-500">${date}</span>
        </div>
        <p class="text-sm text-gray-700">${item.content}</p>
      `;
      
      newsFeedContainer.appendChild(newsItem);
    });
  } catch (error) {
    console.error('Error loading news:', error);
    
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
