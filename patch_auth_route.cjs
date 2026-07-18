const fs = require('fs');
let content = fs.readFileSync('server/routes/auth.ts', 'utf-8');

const route = `
router.post('/google', (req, res) => {
  const { email, name, picture } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required from Google' });
  }
  
  let user = mockUsers.find(u => u.email === email);
  let isNewSignup = false;
  
  if (!user) {
    isNewSignup = true;
    user = {
      id: Date.now().toString(),
      name: name || email.split('@')[0],
      email: email,
      role: 'Company Admin',
      picture
    };
    mockUsers.push(user);
    
    const newWorkspace = {
      id: \`ws_\${Date.now()}\`,
      ownerId: user.id,
      name: \`\${user.name}'s Workspace\`
    };
    mockWorkspaces.push(newWorkspace);
  }
  
  const userWorkspace = mockWorkspaces.find(ws => ws.ownerId === user.id);
  
  res.json({
    user,
    token: 'mock-jwt-token-google',
    hasWorkspace: !!userWorkspace,
    workspaceId: userWorkspace?.id || null,
    isNewSignup
  });
});
`;

content = content.replace(/export default router;/, route + '\nexport default router;');

fs.writeFileSync('server/routes/auth.ts', content);
