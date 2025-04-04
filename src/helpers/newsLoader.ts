
import { fetchNews } from '@/lib/adminService';

/**
 * Helper to load news into the profile page
 */
export async function loadNewsIntoProfile() {
  try {
    // Get the news container element
    const newsContainer = document.getElementById('profile-news-feed');
    if (!newsContainer) return;
    
    // Fetch news items
    const newsItems = await fetchNews();
    
    // Clear loading indicator
    newsContainer.innerHTML = '';
    
    // If no news items, show a message
    if (newsItems.length === 0) {
      newsContainer.innerHTML = `
        <div class="text-center py-4">
          <p class="text-sm text-gray-500">Keine Neuigkeiten vorhanden.</p>
        </div>
      `;
      return;
    }
    
    // Create HTML for each news item
    newsItems.slice(0, 3).forEach(item => {
      const newsElement = document.createElement('div');
      newsElement.className = 'p-3 bg-gray-50 rounded-md';
      
      const createdDate = new Date(item.created_at);
      const formattedDate = createdDate.toLocaleDateString('de-DE');
      
      newsElement.innerHTML = `
        <div class="flex justify-between items-center mb-1">
          <h3 class="font-medium">${item.title}</h3>
          <span class="text-xs text-gray-500">${formattedDate}</span>
        </div>
        <p class="text-sm text-gray-600">${item.content}</p>
      `;
      
      newsContainer.appendChild(newsElement);
    });
    
    // If there are more news items, add a "show all" link
    if (newsItems.length > 3) {
      const showMoreElement = document.createElement('div');
      showMoreElement.className = 'text-center mt-2';
      showMoreElement.innerHTML = `
        <button class="text-sm text-blue-600 hover:text-blue-800">
          Alle ${newsItems.length} Neuigkeiten anzeigen
        </button>
      `;
      
      // Add click event to navigate to news section
      showMoreElement.querySelector('button')?.addEventListener('click', () => {
        // This assumes a news page will be created in the future
        window.location.href = '/profile?tab=news';
      });
      
      newsContainer.appendChild(showMoreElement);
    }
  } catch (error) {
    console.error('Error loading news into profile:', error);
    
    // Show error message
    const newsContainer = document.getElementById('profile-news-feed');
    if (newsContainer) {
      newsContainer.innerHTML = `
        <div class="text-center py-4">
          <p class="text-sm text-red-500">Fehler beim Laden der Neuigkeiten.</p>
        </div>
      `;
    }
  }
}

// Auto-load news when script is imported in profile page
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/profile') {
    setTimeout(() => {
      loadNewsIntoProfile();
    }, 500); // Slight delay to ensure the container is rendered
  }
});
