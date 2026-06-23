import { useState } from 'react'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { MonitorPlay, AlertTriangle, ExternalLink } from 'lucide-react'

export default function Dashboard() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const openProjector = async () => {
    setErrorMsg(null)
    try {
      const label = 'projector-' + Date.now()
      const appWindow = new WebviewWindow(label, {
        url: '/',
        title: 'Proyector - EventPix',
        fullscreen: true,
        decorations: false,
      })
      
      appWindow.once('tauri://error', function (e) {
        setErrorMsg('Error nativo de Tauri: ' + JSON.stringify(e))
      })
    } catch (error: any) {
      setErrorMsg('Error al abrir ventana: ' + (error?.message || error))
      window.open('/#/sorteador', '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Dashboard General</h1>
        <p className="text-slate-500 dark:text-slate-400">Resumen operativo offline y sincronización</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Base Local</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white">0</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Registros</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Estado Nube</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">Pendiente</p>
          </div>
        </div>

        {/* Sync Button */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Sincronización</p>
          </div>
          <button className="w-full mt-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl transition-all">
            Sincronizar
          </button>
        </div>

        {/* Proyector Button */}
        <div 
          onClick={openProjector}
          className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl p-1 shadow-2xl relative group overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/20 blur-2xl group-hover:bg-white/40 transition-colors" />
          <div className="h-full bg-slate-900/40 backdrop-blur-sm rounded-xl p-6 flex flex-col justify-between border border-white/10 group-hover:border-white/30 transition-all">
            <div>
              <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Show en Vivo</p>
              <p className="text-xl font-black text-white leading-tight">Abrir Proyector</p>
            </div>
            <div className="flex justify-end mt-4">
              <MonitorPlay className="w-8 h-8 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>

      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mt-6 flex flex-col items-start shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-bold mb-2">
            <AlertTriangle size={24} /> 
            <span>Ocurrió un error al crear la ventana nativa</span>
          </div>
          <p className="text-sm text-red-800 dark:text-red-300 font-mono bg-white/50 dark:bg-black/20 p-3 rounded-lg w-full mb-4">
            {errorMsg}
          </p>
          <div className="flex flex-col gap-2 w-full border-t border-red-200 dark:border-red-800 pt-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Alternativa: Abrir en navegador web</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Si tu Mac bloquea ventanas secundarias, puedes usar Safari o Chrome.</p>
            <a 
              href="/#/sorteador" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors self-start mt-2"
            >
              <ExternalLink size={16} /> Abrir Sorteador en Navegador
            </a>
          </div>
        </div>
      )}

    </div>
  )
}
