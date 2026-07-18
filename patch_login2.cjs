const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

const tabsTarget = `<Tabs value={mode} onValueChange={(v) => { setMode(v as any); setError('') }} className="w-full">
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

                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      setError('Google Sign-In Failed')
                    }}
                    useOneTap
                  />
                </div>
              </form>
            </Tabs>`;

const tabsReplacement = `<div className="w-full space-y-4">
              {error && (
                <div className="text-sm font-medium text-red-500 text-center mb-4">{error}</div>
              )}
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError('Google Sign-In Failed')
                  }}
                  useOneTap
                  theme="filled_black"
                  size="large"
                  text="continue_with"
                  width="100%"
                />
              </div>
            </div>`;

content = content.replace(tabsTarget, tabsReplacement);

fs.writeFileSync('src/pages/Login.tsx', content);
