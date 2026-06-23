import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin, isDarkMode, toggleTheme }: { onLogin: () => void, isDarkMode: boolean, toggleTheme: () => void }) {
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login for now
    if (password === 'admin123') {
      onLogin()
      navigate('/dashboard')
    } else {
      alert('Contraseña incorrecta. Usa admin123 para probar.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
      <button 
        onClick={toggleTheme}
        className="absolute top-8 right-8 p-3 rounded-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-lg border border-slate-200 dark:border-slate-800 hover:scale-110 transition-all"
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 z-10 relative">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-3xl">EP</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">EventPix Admin</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Terminal de Operaciones Offline</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Código de Acceso
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              autoFocus
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            Acceder al Sistema
          </button>
        </form>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
    </div>
  )
}
