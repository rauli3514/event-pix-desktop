import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import TvMenu from '../components/TvMenu';

export default function DesktopPlayer() {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setShowMenu(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // 1. Cargar datos de Supabase en tiempo real
  useEffect(() => {
    const deviceId = localStorage.getItem('device_id');
    if (!deviceId) return;

    const fetchAssignedMedia = async () => {
      // 1. Obtener UUID del dispositivo
      const { data: device, error } = await supabase
        .from('display_devices')
        .select('id, group_id, pairing_status')
        .eq('device_id', deviceId)
        .single();
      
      if (error || !device) return;

      // 2. Buscar asignaciones para el dispositivo o su zona
      let orQuery = `device_id.eq.${device.id}`;
      if (device.group_id) {
        orQuery += `,group_id.eq.${device.group_id}`;
      }

      const { data: assignments } = await supabase
        .from('display_assignments')
        .select(`
          *,
          media:display_media(*),
          campaign:display_campaigns(*)
        `)
        .or(orQuery)
        .order('created_at', { ascending: false })
        .limit(1);

      if (assignments && assignments.length > 0) {
        const assignment = assignments[0];
        
        if (assignment.campaign && assignment.campaign.items_json) {
          // Playlist
          const mediaIds = assignment.campaign.items_json.map((i: any) => i.media_id);
          if (mediaIds.length === 0) {
            setMediaItems([]);
            return;
          }
          
          const { data: mediaRows } = await supabase
            .from('display_media')
            .select('*')
            .in('id', mediaIds);
            
          if (mediaRows) {
            const compiledItems = assignment.campaign.items_json.map((item: any) => {
              const media = mediaRows.find((m: any) => m.id === item.media_id);
              if (!media) return null;
              return {
                id: item.id,
                type: media.type.split('/')[0],
                url: media.url,
                duration: item.duration || 10
              };
            }).filter(Boolean);
            setMediaItems(compiledItems);
          }
        } else if (assignment.media) {
          // Single media
          setMediaItems([{
            id: assignment.media.id,
            type: assignment.media.type.split('/')[0],
            url: assignment.media.url,
            duration: 10
          }]);
        } else {
          setMediaItems([]);
        }
      } else {
        setMediaItems([]);
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
        if (payload.new.pairing_status === 'pending') {
          window.location.reload();
        }
        fetchAssignedMedia(); // Refrescar contenido
      })
      .subscribe();

    const assignmentChannel = supabase
      .channel('public:display_assignments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'display_assignments' }, () => {
        fetchAssignedMedia();
      })
      .subscribe();

    // Latido (Heartbeat) cada 30 segundos y polling de respaldo
    const heartbeatInterval = setInterval(async () => {
      // 1. Enviar latido para que el Hub lo vea "En línea"
      await supabase.from('display_devices')
        .update({ last_seen: new Date().toISOString() })
        .eq('device_id', deviceId);
        
      // 2. Polling de respaldo (por si Realtime falla) para contenido y desvinculación
      const { data } = await supabase.from('display_devices').select('pairing_status').eq('device_id', deviceId).single();
      if (data && data.pairing_status === 'pending') {
        window.location.reload();
      } else {
        fetchAssignedMedia();
      }
    }, 30000);
    
    // Latido inicial inmediato
    supabase.from('display_devices').update({ last_seen: new Date().toISOString() }).eq('device_id', deviceId).then();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(assignmentChannel);
      clearInterval(heartbeatInterval);
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
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white relative">
        <p className="text-2xl text-zinc-500 animate-pulse">Sin contenido asignado...</p>
        <p className="absolute bottom-10 text-zinc-700 text-sm">Presiona OK para abrir el menú</p>
        {showMenu && <TvMenu onClose={() => setShowMenu(false)} />}
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
      {showMenu && <TvMenu onClose={() => setShowMenu(false)} />}
    </div>
  );
}
