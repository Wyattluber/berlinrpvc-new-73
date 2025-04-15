
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Komponente
 * Scrollt automatisch zum Seitenanfang wenn sich die Route ändert
 * und verhindert "Flackern" der Seite beim Seitenwechsel
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Zum Anfang der Seite scrollen mit smooth behavior für bessere UX
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // 'auto' instead of 'smooth' to prevent visual jumps
    });
    
    // Fokus vom aktiven Element entfernen, um unerwünschte Tastatureingaben zu vermeiden
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
