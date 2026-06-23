import { useState, useRef, useEffect } from 'react'
import { Trophy } from 'lucide-react'

export default function Sorteador() {
  const [status, setStatus] = useState<'idle' | 'rolling' | 'flash' | 'finished'>('idle')
  const [currentDisplay, setCurrentDisplay] = useState('ESPERANDO')
  const [winner, setWinner] = useState<{ nombre: string, dni: string, codigo: string } | null>(null)
  
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRaffle = () => {
    setStatus('rolling')
    
    // En el futuro, esto leerá de IndexedDB/LocalForage
    // Por ahora, simulamos una base de datos descargada offline
    const dummyDatabase = [
      { nombre: 'Juan P.', dni: '1234', codigo: 'FAN-94821' },
      { nombre: 'María G.', dni: '9921', codigo: 'FAN-22341' },
      { nombre: 'Carlos M.', dni: '5532', codigo: 'FAN-88329' },
      { nombre: 'Ana L.', dni: '1123', codigo: 'FAN-99012' }
    ]
    
    const winningData = dummyDatabase[Math.floor(Math.random() * dummyDatabase.length)]
    
    let currentIndex = 0
    let currentSpeed = 50 
    let iterations = 0
    const maxIterations = 45 

    const roll = () => {
      if (iterations >= maxIterations) {
        setCurrentDisplay(winningData.codigo)
        setStatus('flash')
        
        setTimeout(() => {
          setWinner(winningData)
          setStatus('finished')
        }, 1000)
        return
      }

      setCurrentDisplay(`FAN-${Math.floor(10000 + Math.random() * 90000)}`)
      currentIndex++
      iterations++

      if (iterations > maxIterations - 15) {
        currentSpeed += 30
      }

      rollIntervalRef.current = setTimeout(roll, currentSpeed)
    }

    roll()
  }

  const resetRaffle = () => {
    setStatus('idle')
    setCurrentDisplay('ESPERANDO')
    setWinner(null)
  }

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearTimeout(rollIntervalRef.current)
    }
  }, [])

  return (
    <div className="w-screen h-screen bg-[#050510] text-white overflow-hidden relative flex flex-col justify-center items-center">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none select-none">
        <h1 className="text-[15vw] font-black tracking-tighter text-blue-900/40 whitespace-nowrap">EVENT PIX</h1>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 to-transparent pointer-events-none z-0" />
      
      {/* Flash Effect Overlay */}
      <div className={`absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-500
        ${status === 'flash' ? 'opacity-80' : 'opacity-0'}
      `} />

      {/* Main Content */}
      <div className="z-10 w-full max-w-5xl flex flex-col items-center">
        {/* Header Title */}
        <div className="text-center mb-12">
           <p className={`text-lg sm:text-2xl font-bold tracking-[0.4em] uppercase transition-colors duration-1000
             ${status === 'finished' ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'text-blue-200/50'}
           `}>
             {status === 'finished' ? '¡GANADOR DEL SORTEO!' : 'CÓDIGO GANADOR'}
           </p>
        </div>

        {/* Code Display */}
        <div className={`relative px-8 py-4 sm:px-16 sm:py-8 transition-all duration-1000
          ${status === 'finished' ? 'scale-110' : 'scale-100'}
        `}>
          <div className={`absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full transition-opacity duration-1000 
            ${status === 'finished' || status === 'flash' ? 'opacity-100' : 'opacity-0'}`} />
            
          <h2 className={`relative z-10 text-6xl sm:text-8xl md:text-[10rem] font-black font-mono tracking-tighter transition-all duration-100 leading-none
            ${status === 'rolling' ? 'text-white/70 blur-[2px] scale-105' : 'text-white drop-shadow-2xl'}
            ${status === 'flash' ? 'text-white drop-shadow-[0_0_50px_rgba(255,255,255,1)] scale-105' : ''}
            ${status === 'finished' ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]' : ''}
          `}>
            {currentDisplay}
          </h2>
        </div>

        {/* Action Button */}
        {status === 'idle' && (
          <button 
            onClick={startRaffle}
            className="mt-16 bg-white hover:bg-slate-100 text-black text-2xl sm:text-4xl font-black py-6 px-16 rounded-[3rem] shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-4"
          >
            <Trophy size={40} className="text-blue-600" /> SORTEAR AHORA
          </button>
        )}

        {/* Winner Reveal Card */}
        {winner && status === 'finished' && (
          <div className="mt-12 animate-in slide-in-from-bottom-12 fade-in duration-1000 w-full max-w-2xl">
            <div className="bg-black/40 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />
              
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(250,204,21,0.4)] relative z-10">
                <Trophy className="w-10 h-10 text-black fill-yellow-200" />
              </div>
              
              <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-1 relative z-10">Felicidades</p>
              <h3 className="text-5xl font-black text-white mb-8 relative z-10">{winner.nombre}</h3>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-around items-center relative z-10">
                <div>
                  <p className="text-xs uppercase text-white/40 font-bold tracking-widest mb-1">DNI (Últ. 4)</p>
                  <p className="text-2xl font-mono text-white/90">****{winner.dni}</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div>
                  <p className="text-xs uppercase text-white/40 font-bold tracking-widest mb-1">Código</p>
                  <p className="text-2xl font-mono text-white/90">{winner.codigo}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={resetRaffle}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors"
              >
                Nuevo Sorteo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
