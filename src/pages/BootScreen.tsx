import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function BootScreen({ onReady }: { onReady: () => void }) {
  const [pin, setPin] = useState<string>('');

  useEffect(() => {
    async function initDevice() {
      // Check if device_id exists in localStorage
      let deviceId = localStorage.getItem('device_id');
      
      if (!deviceId) {
        // Generate new 6 char code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const newPin = Array.from({ length: 6 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
        deviceId = newPin;
        localStorage.setItem('device_id', deviceId);
        
        // Insert into Supabase
        await supabase.from('display_devices').insert([
          { device_id: deviceId, pairing_status: 'pending' }
        ]).select().single();
      } else {
        // Update last seen if exists
        await supabase.from('display_devices')
          .update({ last_seen: new Date().toISOString() })
          .eq('device_id', deviceId);
      }
      
      setPin(deviceId);
      
      // Check if already active
      const { data } = await supabase.from('display_devices')
        .select('pairing_status')
        .eq('device_id', deviceId)
        .single();
        
      if (data && data.pairing_status === 'linked') {
        onReady();
        return;
      }
      
      // Subscribe to real-time changes
      const subscription = supabase
        .channel('public:display_devices')
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'display_devices',
            filter: `device_id=eq.${deviceId}`
          }, 
          (payload) => {
            if (payload.new.pairing_status === 'linked') {
              subscription.unsubscribe();
              onReady();
            }
          }
        )
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    }
    
    initDevice();
  }, [onReady]);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-black text-white p-8">
      <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-3xl text-center shadow-2xl max-w-lg w-full">
        <h1 className="text-4xl font-bold mb-4">EventPix Desktop</h1>
        <p className="text-zinc-400 mb-8 text-lg">Para vincular esta pantalla, ingresa el siguiente código en el panel de control:</p>
        
        <div className="bg-zinc-950 px-10 py-6 rounded-2xl border border-zinc-800 inline-block">
          <p className="text-6xl font-mono tracking-widest text-[#00E5FF] font-bold">
            {pin || '------'}
          </p>
        </div>
        
        <div className="mt-12 flex items-center justify-center space-x-3 text-zinc-500">
          <div className="w-4 h-4 rounded-full border-2 border-t-[#00E5FF] animate-spin"></div>
          <p>Esperando contenido...</p>
        </div>
      </div>
    </div>
  );
}
