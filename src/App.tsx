import { useState, useEffect } from 'react';
import BootScreen from './pages/BootScreen';
import DesktopPlayer from './pages/DesktopPlayer';
import { supabase } from './lib/supabase';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [isPaired, setIsPaired] = useState(false);

  useEffect(() => {
    // Hide mouse cursor after 3 seconds of inactivity to act like a real display
    let timeout: NodeJS.Timeout;
    const hideCursor = () => {
      document.body.style.cursor = 'none';
    };
    const resetCursor = () => {
      document.body.style.cursor = 'default';
      clearTimeout(timeout);
      timeout = setTimeout(hideCursor, 3000);
    };
    
    window.addEventListener('mousemove', resetCursor);
    timeout = setTimeout(hideCursor, 3000);
    
    return () => {
      window.removeEventListener('mousemove', resetCursor);
      clearTimeout(timeout);
    };
  }, []);

  const handleReady = () => {
    setIsReady(true);
  };

  if (!isReady) {
    return <BootScreen onReady={handleReady} />;
  }

  // Si no está pareado, lo mandamos al reproductor igual, que dirá "Sin contenido"
  return <DesktopPlayer />;
}

export default App;
