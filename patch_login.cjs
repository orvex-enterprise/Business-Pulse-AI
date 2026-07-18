const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

content = content.replace(/import \{ Tabs, TabsContent, TabsList, TabsTrigger \} from '@\/components\/ui\/tabs'/, 
`import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'`);

content = content.replace(/const handleGoogleAuth = \(e: React.MouseEvent\) => \{[\s\S]*?\}\n/, 
`const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('')
    setLoading(true)
    try {
      const decoded: any = jwtDecode(credentialResponse.credential)
      
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: decoded.email, name: decoded.name, picture: decoded.picture })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Google Authentication failed')
      
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
        navigate('/onboarding')
      } else if (data.hasWorkspace) {
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
`);

content = content.replace(/<Button type="button" variant="outline" className="w-full" onClick=\{handleGoogleAuth\} disabled=\{loading\}>\s*Google\s*<\/Button>/, 
`<div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      setError('Google Sign-In Failed')
                    }}
                    useOneTap
                  />
                </div>`);

fs.writeFileSync('src/pages/Login.tsx', content);
