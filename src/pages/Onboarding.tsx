import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useOnboardingStore, DatabaseType, MonitoringPreference } from '@/store/useOnboardingStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { UploadCloud, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export function Onboarding() {
  const navigate = useNavigate()
  const store = useOnboardingStore()
  const setCompanyDetails = useSettingsStore(state => state.setCompanyDetails)
  const addConnection = useSettingsStore(state => state.addConnection)

  const [dbCreds, setDbCreds] = useState<any>({})
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [testMsg, setTestMsg] = useState('')
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)

  const handleTestConnection = async () => {
    setTestStatus('loading')
    try {
      const res = await fetch('/api/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: store.databaseType?.toLowerCase(), credentials: dbCreds })
      })
      const data = await res.json()
      if (res.ok) {
        setTestStatus('success')
        setTestMsg('Connection successful!')
        store.setDatabaseConnectionStr(JSON.stringify(dbCreds))
      } else {
        setTestStatus('error')
        setTestMsg(data.error || 'Connection failed')
        toast.error(data.error || 'Connection failed')
      }
    } catch (e: any) {
      setTestStatus('error')
      setTestMsg(e.message)
      toast.error(e.message)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) return
    setTestStatus('loading')
    
    try {
      const formData = new FormData();
      formData.append('workspaceId', localStorage.getItem('currentWorkspaceId') || 'ws_123');
      Array.from(uploadFiles).forEach((file: any) => {
        formData.append('files', file as Blob);
      });

      const res = await fetch('/api/connections/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setTestStatus('success')
        setTestMsg(`Successfully processed ${data.files.length} file(s). Schemas detected.`)
        store.setDatabaseConnectionStr('file_upload_success')
        
        // Ensure CSV data is registered in the UI state so dashboard doesn't remain empty
        if (data.connection) {
          addConnection({
            id: data.connection.id,
            name: data.connection.name,
            type: data.connection.type,
            connectedAt: new Date().toLocaleDateString()
          })
        }
      } else {
        setTestStatus('error')
        setTestMsg(data.error || 'Upload failed')
        toast.error(data.error || 'Upload failed')
      }
    } catch (e: any) {
      setTestStatus('error')
      setTestMsg(e.message)
      toast.error(e.message)
    }
  }

  const handleNext = async () => {
    if (store.step === 1 && !store.industry?.trim()) {
      alert("Please provide an Industry to continue.");
      return;
    }
    if (store.step === 2 && !store.databaseType) {
      alert("Please add a database to continue, or click Skip.");
      return;
    }
    if (store.step === 2 && store.databaseType && !store.databaseConnectionStr) {
      alert("Please provide the connection string/details or test connection to continue.");
      return;
    }

    if (store.step < 5) {
      store.setStep(store.step + 1)
    } else {
      // API Call to save business profile
      try {
        const workspaceId = localStorage.getItem('currentWorkspaceId') || 'ws_123';
        
        await fetch(`/api/auth/workspace/${workspaceId}/business-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: store.companyName || 'Acme Corp',
            industry: store.industry,
            businessType: store.businessType,
            country: store.country,
            phoneNumber: store.phoneNumber,
            databaseType: store.databaseType
          })
        });

        if (store.databaseType && store.databaseConnectionStr) {
           await fetch('/api/connections', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               workspaceId,
               type: store.databaseType,
               name: `${store.companyName} Data`,
               credentials: store.databaseConnectionStr
             })
           })
        }
      } catch (e) {
        console.error("Failed to save profile", e);
      }

      setCompanyDetails({
        companyName: store.companyName || 'Acme Corp',
        industry: store.industry
      })
      if (store.databaseType && store.databaseConnectionStr) {
        addConnection({
          id: Date.now().toString(),
          name: store.databaseType,
          type: 'Database',
          connectedAt: 'Just now'
        })
      }
      navigate('/')
    }
  }

  const handleBack = () => {
    if (store.step > 1) store.setStep(store.step - 1)
  }

  const databases: DatabaseType[] = ['PostgreSQL', 'MySQL', 'MongoDB', 'Supabase', 'Firebase', 'REST API', 'CSV Upload', 'Excel Upload']
  const monitoring: MonitoringPreference[] = ['Inventory', 'Trends', 'Stocks', 'Finance']

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Welcome to Business Pulse AI</CardTitle>
          <CardDescription>Let's configure your workspace. Step {store.step} of 5</CardDescription>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full bg-zinc-900 transition-all duration-500 ease-in-out dark:bg-zinc-50"
              style={{ width: `${(store.step / 5) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={store.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[300px]"
            >
              {store.step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Company Details</h3>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={store.companyName || ""}
                      onChange={(e) => store.setCompanyDetails({ companyName: e.target.value })}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Input
                      value={store.businessType || ""}
                      onChange={(e) => store.setCompanyDetails({ businessType: e.target.value })}
                      placeholder="e.g. Retail, B2B SaaS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      value={store.industry || ""}
                      onChange={(e) => store.setCompanyDetails({ industry: e.target.value })}
                      placeholder="e.g. Healthcare, Finance, Tech Retail"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      value={store.country || ""}
                      onChange={(e) => store.setCompanyDetails({ country: e.target.value })}
                      placeholder="United States"
                    />
                  </div>
                </div>
              )}

              {store.step === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Connect Data Source</h3>
                    <Button variant="ghost" size="sm" onClick={() => {
                      store.setDatabaseType(undefined as unknown as DatabaseType);
                      store.setDatabaseConnectionStr('');
                      store.setStep(3);
                    }}>
                      Skip
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {databases.map((db) => (
                      <div
                        key={db}
                        onClick={() => {
                          store.setDatabaseType(db)
                          setTestStatus('idle')
                          setTestMsg('')
                          setDbCreds({})
                        }}
                        className={`cursor-pointer rounded-lg border p-3 text-center transition-colors ${
                          store.databaseType === db
                            ? 'border-zinc-900 bg-zinc-900/5 dark:border-zinc-50 dark:bg-zinc-50/10'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-xs font-medium">{db}</span>
                      </div>
                    ))}
                  </div>
                  
                  {store.databaseType && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-4 overflow-hidden"
                    >
                      <div className="rounded-md bg-zinc-100 p-4 dark:bg-zinc-900">
                      
                      {(store.databaseType === 'PostgreSQL' || store.databaseType === 'MySQL') && (
                        <div className="grid gap-3">
                          <Label>Host</Label>
                          <Input placeholder="localhost" value={dbCreds?.host || ""} onChange={e => setDbCreds({...dbCreds, host: e.target.value})} />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Port</Label>
                              <Input placeholder="5432" value={dbCreds?.port || ""} onChange={e => setDbCreds({...dbCreds, port: e.target.value})} />
                            </div>
                            <div>
                              <Label>Database</Label>
                              <Input placeholder="mydb" value={dbCreds?.database || ""} onChange={e => setDbCreds({...dbCreds, database: e.target.value})} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Username</Label>
                              <Input placeholder="admin" value={dbCreds?.username || ""} onChange={e => setDbCreds({...dbCreds, username: e.target.value})} />
                            </div>
                            <div>
                              <Label>Password</Label>
                              <Input type="password" placeholder="••••••••" value={dbCreds?.password || ""} onChange={e => setDbCreds({...dbCreds, password: e.target.value})} />
                            </div>
                          </div>
                          <Button variant="secondary" onClick={handleTestConnection} disabled={testStatus === 'loading'}>
                            {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
                          </Button>
                        </div>
                      )}

                      {store.databaseType === 'MongoDB' && (
                        <div className="grid gap-3">
                          <Label>Mongo URI</Label>
                          <Input placeholder="mongodb+srv://..." value={dbCreds?.uri || ""} onChange={e => setDbCreds({...dbCreds, uri: e.target.value})} />
                          <Button variant="secondary" onClick={handleTestConnection} disabled={testStatus === 'loading'}>
                            {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
                          </Button>
                        </div>
                      )}

                      {(store.databaseType === 'Supabase' || store.databaseType === 'Firebase') && (
                        <div className="grid gap-3">
                          <Label>Project URL</Label>
                          <Input placeholder="https://xyz.supabase.co" value={dbCreds?.url || ""} onChange={e => setDbCreds({...dbCreds, url: e.target.value})} />
                          <Label>API Key</Label>
                          <Input type="password" placeholder="••••••••" value={dbCreds?.key || ""} onChange={e => setDbCreds({...dbCreds, key: e.target.value})} />
                          <Button variant="secondary" onClick={handleTestConnection} disabled={testStatus === 'loading'}>
                            {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
                          </Button>
                        </div>
                      )}

                      {store.databaseType === 'REST API' && (
                        <div className="grid gap-3">
                          <Label>API URL</Label>
                          <Input placeholder="https://api.mybiz.com/v1" value={dbCreds?.url || ""} onChange={e => setDbCreds({...dbCreds, url: e.target.value})} />
                          <Label>Auth Header (Optional)</Label>
                          <Input placeholder="Bearer token..." value={dbCreds?.auth || ""} onChange={e => setDbCreds({...dbCreds, auth: e.target.value})} />
                          <Button variant="secondary" onClick={handleTestConnection} disabled={testStatus === 'loading'}>
                            {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
                          </Button>
                        </div>
                      )}

                      {(store.databaseType === 'CSV Upload' || store.databaseType === 'Excel Upload') && (
                        <div className="grid gap-3">
                          <Label>Upload Files</Label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-300 dark:border-zinc-700">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-2 text-zinc-500" />
                                    <p className="mb-1 text-sm text-zinc-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-zinc-500">.CSV, .XLS, .XLSX</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" multiple accept=".csv, .xls, .xlsx" onChange={(e) => {
                                  setUploadFiles(e.target.files)
                                  setTestStatus('idle')
                                  setTestMsg('')
                                }} />
                            </label>
                          </div>
                          {uploadFiles && uploadFiles.length > 0 && (
                            <div className="text-sm">
                              {uploadFiles.length} file(s) selected
                            </div>
                          )}
                          <Button variant="secondary" onClick={handleFileUpload} disabled={!uploadFiles || testStatus === 'loading'}>
                            {testStatus === 'loading' ? 'Uploading & Parsing...' : 'Upload & Analyze Data'}
                          </Button>
                        </div>
                      )}

                      {testStatus === 'success' && (
                        <div className="mt-3 flex items-center text-sm text-green-600 dark:text-green-400">
                          <CheckCircle2 className="mr-2 h-4 w-4" /> {testMsg}
                        </div>
                      )}
                      {testStatus === 'error' && (
                        <div className="mt-3 flex items-center text-sm text-red-600 dark:text-red-400">
                          <AlertTriangle className="mr-2 h-4 w-4" /> {testMsg}
                        </div>
                      )}

                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {store.step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Telegram Alerts</h3>
                  <p className="text-sm text-zinc-500">We send critical trend opportunities, stock alerts, and database connection alerts directly to your Telegram.</p>
                  <div className="space-y-3">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input 
                      id="phoneNumber" 
                      placeholder="+1 234 567 8900" 
                      value={store.phoneNumber || ""}
                      onChange={(e) => store.setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {store.step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Monitoring Modules</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {monitoring.map((mod) => (
                      <div
                        key={mod}
                        onClick={() => store.toggleMonitoring(mod)}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                          store.monitoring.includes(mod)
                            ? 'border-zinc-900 bg-zinc-900/5 dark:border-zinc-50 dark:bg-zinc-50/10'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{mod}</span>
                          {store.monitoring.includes(mod) && (
                            <span className="text-zinc-900 dark:text-zinc-50">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {store.step === 5 && (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <span className="text-2xl text-zinc-900 dark:text-zinc-50">🚀</span>
                  </div>
                  <h3 className="text-xl font-medium">All Set!</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Your workspace is ready. We are initializing your AI-powered dashboard.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={store.step === 1}
            >
              Back
            </Button>
            <Button onClick={handleNext} disabled={store.step === 1 && !store.industry?.trim()}>
              {store.step === 5 ? 'Go to Dashboard' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
