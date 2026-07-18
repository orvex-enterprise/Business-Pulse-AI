import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { CheckCircle2, Factory, LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/useAuthStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const payload = mode === 'login' 
        ? { email, password } 
        : { email, password, name }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Successful auth
      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      }, data.token)

      if (data.workspaceId) {
        localStorage.setItem('currentWorkspaceId', data.workspaceId)
      }

      if (data.isNewSignup) {
        // First-time users go to onboarding to set business details
        navigate('/onboarding')
      } else if (data.hasWorkspace) {
        // Users with existing workspace go to dashboard directly
        navigate('/')
      } else {
        navigate('/onboarding')
      }
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const payload = { 
        email: 'admin@pulse.ai', 
        password: 'mock_password',
        name: 'Google User',
        authProvider: 'google'
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }
      
      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        companyId: data.workspaceId
      }, data.token)
      
      if (data.workspaceId) {
        localStorage.setItem('currentWorkspaceId', data.workspaceId)
      }
      
      if (data.isNewSignup || !data.hasWorkspace) {
        navigate('/onboarding')
      } else {
        navigate('/')
      }
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50">
                <LineChart className="h-6 w-6 text-zinc-50 dark:text-zinc-900" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Business Pulse AI
              </h2>
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome to your Workspace
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Intelligence for the modern enterprise.
            </p>
          </div>

          <div className="mt-8">
            <Tabs value={mode} onValueChange={(v) => { setMode(v as any); setError('') }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="mt-2">
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name || ""}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <div className="mt-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email || ""}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="mt-2">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password || ""}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm font-medium text-red-500">{error}</div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Workspace')}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-50 dark:bg-zinc-950 px-2 text-zinc-500">Or continue with</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleAuth} disabled={loading}>
                  Google
                </Button>
              </form>
            </Tabs>
          </div>
        </motion.div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-zinc-900 object-cover">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
          <div className="absolute bottom-10 left-10 max-w-xl text-zinc-50">
            <h1 className="text-4xl font-bold tracking-tight">Intelligence for the modern enterprise.</h1>
            <p className="mt-4 text-lg text-zinc-300">
              Connect your data sources, monitor inventory patterns, track market trends, and get AI-driven insights to stay ahead of the curve.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
