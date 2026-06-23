import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Power, RefreshCw, Unplug } from 'lucide-react';

export default function TvMenu({ onClose }: { onClose: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menuItems = [
    {
      id: 'refresh',
      label: 'Refrescar Pantalla',
      icon: <RefreshCw size={24} />,
      action: () => {
        window.location.reload();
      }
    },
    {
      id: 'unpair',
      label: 'Desvincular Pantalla',
      icon: <Unplug size={24} />,
      action: async () => {
        const deviceId = localStorage.getItem('device_id');
        if (deviceId) {
          await supabase.from('display_devices').update({ pairing_status: 'pending', group_id: null }).eq('device_id', deviceId);
        }
        window.location.reload();
      }
    },
    {
      id: 'restart',
      label: 'Reiniciar App',
      icon: <Power size={24} />,
      action: () => {
        // En Tauri o Android podemos forzar cierre, aquí recargamos duro
        window.location.reload();
      }
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev + 1) % menuItems.length);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      } else if (e.key === 'Enter') {
        menuItems[selectedIndex].action();
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl shadow-2xl max-w-md w-full text-white">
        <h2 className="text-2xl font-bold mb-6 text-center text-zinc-300">Menú de Pantalla</h2>
        
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              onClick={item.action}
              className={`flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                selectedIndex === index 
                  ? 'bg-blue-600 text-white scale-105 shadow-lg border border-blue-400' 
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-800 hover:bg-zinc-700'
              }`}
            >
              <div className={`${selectedIndex === index ? 'text-white' : 'text-zinc-500'}`}>
                {item.icon}
              </div>
              <span className="text-lg font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
        
        <p className="text-center text-zinc-600 mt-8 text-sm">
          Usa las flechas del control y OK para seleccionar.<br/>
          Presiona Atrás para salir.
        </p>
      </div>
    </div>
  );
}
