
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Komponente
 * Scrollt automatisch zum Seitenanfang wenn sich die Route ändert
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Zum Anfang der Seite scrollen
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
