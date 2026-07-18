import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { UploadCloud } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function Settings() {
  const { 
    companyName, industry, country, phoneNumber, aiEnabled, aiFrequency, connections, 
    setCompanyDetails, setAISettings, setPhoneNumber, addConnection, removeConnection, setIsDbConnected 
  } = useSettingsStore();
  
  const queryClient = useQueryClient();
  
  const [localName, setLocalName] = useState(companyName || '');
  const [localIndustry, setLocalIndustry] = useState(industry || '');
  const [localCountry, setLocalCountry] = useState(country || '');
  const [localPhone, setLocalPhone] = useState(phoneNumber || '');
  
  const [newConnName, setNewConnName] = useState('');
  const [newConnType, setNewConnType] = useState('');
  const [dbCreds, setDbCreds] = useState<any>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveBusiness = async () => {
    setCompanyDetails({ companyName: localName, industry: localIndustry, country: localCountry, phoneNumber: localPhone });
    
    const workspaceId = localStorage.getItem('currentWorkspaceId') || 'ws_123';
    try {
      await fetch(`/api/auth/workspace/${workspaceId}/business-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: localName,
          industry: localIndustry,
          country: localCountry,
          phoneNumber: localPhone,
          aiEnabled,
          aiFrequency
        })
      });
      // Invalidate queries to re-trigger AI pipeline with new industry
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['trends'] });
            toast.success('Business profile saved successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save business profile');
    }
  };

  const handleAIChange = (enabled: boolean) => {
    setAISettings({ aiEnabled: enabled });
  };

    const handleFreqChange = async (freq: string) => {
    try {
      await fetch('/api/settings/frequency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiFrequency: freq, workspaceId: 'ws_123', phoneNumber: localPhone })
      });
    } catch(e) {}
    setAISettings({ aiFrequency: freq });
  };

  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);

  const handleAddConnection = async () => {
    try {
    if (!newConnType) {
      toast.error('Please select a connection type');
      return;
    }
    
    const isFileUpload = newConnType === 'CSV Upload' || newConnType === 'Excel Upload';
    
    if (!newConnName) {
      if (isFileUpload) {
        setNewConnName('Data Upload'); // Default name for file uploads
      } else {
        setConnStatus('error');
        setErrorMsg('Please enter a connection name');
        toast.error('Please enter a connection name');
        return;
      }
    }
    
    const finalConnName = newConnName || 'Data Upload';
    
    if (!isFileUpload) {
      const isDbCredsEmpty = Object.keys(dbCreds).length === 0 || Object.values(dbCreds).every(v => !v);
      if (isDbCredsEmpty) {
        setConnStatus('error');
        setErrorMsg('Database credentials are required');
        toast.error('Database credentials are required');
        return;
      }
    }

    setConnStatus('loading');
    setErrorMsg('');
    
    try {
      let data;
      if (isFileUpload) {
        if (!uploadFiles || uploadFiles.length === 0) {
          setConnStatus('error');
          setErrorMsg('No files selected');
          toast.error('No files selected');
          return;
        }
        
        const formData = new FormData();
        formData.append('workspaceId', localStorage.getItem('currentWorkspaceId') || 'ws_123');
        formData.append('connectionId', `conn_${Date.now()}`);
        Array.from(uploadFiles).forEach((file: any) => {
          formData.append('files', file as Blob);
        });

        const res = await fetch('/api/connections/upload', {
          method: 'POST',
          body: formData
        });
        
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
      } else {
        const res = await fetch('/api/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId: localStorage.getItem('currentWorkspaceId') || 'ws_123',
            type: newConnType,
            name: finalConnName,
            credentials: Object.keys(dbCreds).length > 0 ? dbCreds : ''
          })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Connection failed');
      }
      
      addConnection({
        id: data.connection?.id || Date.now().toString(),
        name: finalConnName,
        type: newConnType,
        connectedAt: new Date().toLocaleDateString()
      });
      
      setIsDbConnected(true, data.connection?.id || Date.now().toString());
      
      setIsDialogOpen(false);
      setNewConnName('');
      setNewConnType('');
      setDbCreds({});
      setUploadFiles(null);
      setConnStatus('idle');
      
      toast.success(`${finalConnName} connected successfully`);
      
      // Force dashboard cache invalidation immediately on success
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (e: any) {
      setConnStatus('error');
      setErrorMsg(e.message);
      toast.error(e.message);
    }
    } catch (unexpectedError: any) {
      console.error(unexpectedError);
      toast.error(unexpectedError.message || 'An unexpected error occurred');
      setConnStatus('error');
    }
  };

  const handleRemoveConnection = async (id: string) => {
    removeConnection(id);
    if (connections.length <= 1) { // checking length before state update, so if it's 1 it goes to 0
      setIsDbConnected(false);
    }
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage your business information, data sources, and AI preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
            <CardDescription>Update your company details to tailor AI insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={localName || ""} onChange={(e) => setLocalName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input value={localIndustry || ""} onChange={(e) => setLocalIndustry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={localCountry || ""} onChange={(e) => setLocalCountry(e.target.value)} />
            </div>
            <Button onClick={handleSaveBusiness}>Save Business Info</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI & Notifications</CardTitle>
            <CardDescription>Configure AI agents and notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable AI Recommendations</Label>
                <p className="text-sm text-zinc-500">Allow AI agents to analyze data and suggest actions.</p>
              </div>
              <Switch checked={aiEnabled} onCheckedChange={handleAIChange} />
            </div>
            
            <div className="space-y-2">
              <Label>Analysis Frequency</Label>
              <Select value={aiFrequency || "realtime"} onValueChange={handleFreqChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time (High resource)</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="space-y-0.5">
                <Label htmlFor="telegramPhone">Telegram Alerts Phone Number</Label>
                <p className="text-sm text-zinc-500">We will send critical alerts directly to your Telegram.</p>
              </div>
              <Input 
                id="telegramPhone" 
                placeholder="+1 234 567 8900" 
                value={localPhone || ""} 
                onChange={(e) => setLocalPhone(e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Data Connections</CardTitle>
            <CardDescription>Manage connected databases and APIs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connections.length === 0 ? (
              <p className="text-sm text-zinc-500">No data sources connected.</p>
            ) : (
              connections.map((conn) => (
                <div key={conn.id} className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg dark:border-zinc-800">
                  <div>
                    <h4 className="font-medium text-sm">{conn.name} <span className="text-xs font-normal px-2 py-0.5 bg-zinc-100 rounded-full dark:bg-zinc-800">{conn.type}</span></h4>
                    <p className="text-xs text-zinc-500 mt-1">Connected {conn.connectedAt}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveConnection(conn.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900">Disconnect</Button>
                </div>
              ))
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger render={<Button variant="secondary" />}>
                Add New Connection
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Data Connection</DialogTitle>
                  <DialogDescription>
                    Connect a new API or database to enrich your insights.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Connection Name</Label>
                    <Input placeholder="e.g. Primary Postgres DB" value={newConnName || ""} onChange={(e) => setNewConnName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['PostgreSQL', 'MySQL', 'MongoDB', 'Supabase', 'Firebase', 'REST API', 'CSV Upload', 'Excel Upload'].map((db) => (
                        <div
                          key={db}
                          onClick={() => {
                            setNewConnType(db)
                            setConnStatus('idle')
                            setErrorMsg('')
                            setDbCreds({})
                          }}
                          className={`cursor-pointer rounded-lg border p-3 text-center transition-colors ${
                            newConnType === db
                              ? 'border-zinc-900 bg-zinc-900/5 dark:border-zinc-50 dark:bg-zinc-50/10'
                              : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-xs font-medium">{db}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {newConnType && (
                    <div className="space-y-3 pt-2">
                      <div className="rounded-md bg-zinc-100 p-4 dark:bg-zinc-900">
                        {(newConnType === 'PostgreSQL' || newConnType === 'MySQL') && (
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
                          </div>
                        )}

                        {newConnType === 'MongoDB' && (
                          <div className="grid gap-3">
                            <Label>Mongo URI</Label>
                            <Input placeholder="mongodb+srv://..." value={dbCreds?.uri || ""} onChange={e => setDbCreds({...dbCreds, uri: e.target.value})} />
                          </div>
                        )}

                        {(newConnType === 'Supabase' || newConnType === 'Firebase') && (
                          <div className="grid gap-3">
                            <Label>Project URL</Label>
                            <Input placeholder="https://xyz.supabase.co" value={dbCreds?.url || ""} onChange={e => setDbCreds({...dbCreds, url: e.target.value})} />
                            <Label>API Key</Label>
                            <Input type="password" placeholder="••••••••" value={dbCreds?.key || ""} onChange={e => setDbCreds({...dbCreds, key: e.target.value})} />
                          </div>
                        )}

                        {newConnType === 'REST API' && (
                          <div className="grid gap-3">
                            <Label>API URL</Label>
                            <Input placeholder="https://api.mybiz.com/v1" value={dbCreds?.url || ""} onChange={e => setDbCreds({...dbCreds, url: e.target.value})} />
                            <Label>Auth Header (Optional)</Label>
                            <Input placeholder="Bearer token..." value={dbCreds?.auth || ""} onChange={e => setDbCreds({...dbCreds, auth: e.target.value})} />
                          </div>
                        )}

                        {(newConnType === 'CSV Upload' || newConnType === 'Excel Upload') && (
                          <div className="grid gap-3">
                            <Label>Upload Files</Label>
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-300 dark:border-zinc-700">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <p className="mb-1 text-sm text-zinc-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                      <p className="text-xs text-zinc-500">.CSV, .XLS, .XLSX</p>
                                  </div>
                                  <input type="file" className="hidden" multiple accept=".csv, .xls, .xlsx" onChange={(e) => {
                                    setUploadFiles(e.target.files)
                                    setConnStatus('idle')
                                    setErrorMsg('')
                                  }} />
                              </label>
                            </div>
                            {uploadFiles && uploadFiles.length > 0 && (
                              <div className="text-sm">
                                {uploadFiles.length} file(s) selected
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <Button className="w-full mt-4" onClick={handleAddConnection} disabled={connStatus === 'loading' || !newConnType}>
                    {connStatus === 'loading' 
                      ? (newConnType === 'CSV Upload' || newConnType === 'Excel Upload' ? 'Uploading...' : 'Connecting...') 
                      : (newConnType === 'CSV Upload' || newConnType === 'Excel Upload' ? 'Upload' : 'Connect')}
                  </Button>
                  {connStatus === 'error' && (
                    <p className="text-sm text-red-500 text-center">{errorMsg || 'Failed to connect. Please try again.'}</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
