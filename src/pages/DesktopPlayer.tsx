import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
// import { writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';

export default function DesktopPlayer() {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Cargar datos de Supabase en tiempo real
  useEffect(() => {
    const deviceId = localStorage.getItem('device_id');
    if (!deviceId) return;

    const fetchAssignedMedia = async () => {
      const { data, error } = await supabase
        .from('display_devices')
        .select('assigned_media, group_id')
        .eq('device_id', deviceId)
        .single();
      
      if (!error && data?.assigned_media) {
        // Para simplificar, asumimos que si hay assigned_media, reproducimos eso (ignora las listas complejas por ahora)
        setMediaItems([{
          id: data.assigned_media.id,
          type: data.assigned_media.type,
          url: data.assigned_media.url,
          duration: data.assigned_media.duration || 10
        }]);
      }
    };

    fetchAssignedMedia();

    // Suscripción en tiempo real
    const channel = supabase
      .channel('public:display_devices')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'display_devices',
        filter: `device_id=eq.${deviceId}`
      }, (payload) => {
        console.log("Actualización en tiempo real:", payload);
        fetchAssignedMedia(); // Refrescar contenido
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Lógica de bucle
  useEffect(() => {
    if (mediaItems.length === 0) return;

    const currentItem = mediaItems[currentIndex];
    
    // Si es video, el evento onEnded cambia al siguiente.
    if (currentItem.type === 'video') return;

    // Si es imagen o web, usamos un timer basado en su duración
    const durationMs = (currentItem.duration || 10) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [currentIndex, mediaItems]);

  const handleVideoEnd = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  if (mediaItems.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <p className="text-2xl text-zinc-500 animate-pulse">Sin contenido asignado...</p>
      </div>
    );
  }

  const currentItem = mediaItems[currentIndex];

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {currentItem.type === 'image' && (
        <img 
          src={currentItem.url} 
          className="w-full h-full object-contain absolute inset-0 animate-fade-in"
          alt="Pantalla"
        />
      )}
      
      {currentItem.type === 'video' && (
        <video 
          ref={videoRef}
          src={currentItem.url} 
          className="w-full h-full object-contain absolute inset-0"
          autoPlay 
          muted 
          onEnded={handleVideoEnd}
        />
      )}

      {currentItem.type === 'web' && (
        <iframe 
          src={currentItem.url}
          className="w-full h-full border-none absolute inset-0"
          title="Web Content"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      )}
    </div>
  );
}
