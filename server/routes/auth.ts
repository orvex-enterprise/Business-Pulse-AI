import { Router } from 'express';

const router = Router();

// In-memory mock database
const mockUsers: any[] = [];
const mockWorkspaces: any[] = [];

router.post('/login', (req, res) => {
  const { email, password, authProvider = 'email' } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user in mock DB or simulate existing valid user
  let user = mockUsers.find(u => u.email === email);
  
  // If not found in mock DB, but it's one of the whitelisted from before, mock it
  const whitelistedDomains = ['admin.com', 'company.com'];
  const domain = email.split('@')[1];
  
  if (!user && (whitelistedDomains.includes(domain) || email === 'admin@pulse.ai')) {
    user = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email: email,
      role: email.includes('admin') ? 'Super Admin' : 'Company Admin',
    };
    mockUsers.push(user);
    
    // Auto-create a workspace for the whitelisted mock user to simulate an existing user with a workspace
    const workspace = { id: `ws_${Date.now()}`, ownerId: user.id, name: `${user.name}'s Workspace` };
    mockWorkspaces.push(workspace);
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found. Please sign up.' });
  }

  const userWorkspace = mockWorkspaces.find(ws => ws.ownerId === user.id);

  res.json({
    user,
    token: 'mock-jwt-token',
    hasWorkspace: !!userWorkspace,
    workspaceId: userWorkspace?.id || null
  });
});

router.post('/signup', (req, res) => {
  const { email, password, name, authProvider = 'email' } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists. Please login.' });
  }

  const newUser = {
    id: Date.now().toString(),
    name: name || email.split('@')[0],
    email: email,
    role: 'Company Admin',
  };
  mockUsers.push(newUser);

  // Automatically create isolated workspace for new user
  const newWorkspace = {
    id: `ws_${Date.now()}`,
    ownerId: newUser.id,
    name: `${newUser.name}'s Workspace`
  };
  mockWorkspaces.push(newWorkspace);

  res.json({
    user: newUser,
    token: 'mock-jwt-token',
    hasWorkspace: true,
    workspaceId: newWorkspace.id,
    isNewSignup: true
  });
});

router.post('/workspace/:id/business-profile', (req, res) => {
  const { id } = req.params;
  const profileData = req.body;
  
  // In a real app, save to BusinessProfile table linked to the Workspace
  res.json({ success: true, message: 'Business profile updated successfully', profile: profileData });
});

router.get('/me', (req, res) => {
  res.json({ id: '1', name: 'Admin', role: 'Super Admin' });
});


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
      id: `ws_${Date.now()}`,
      ownerId: user.id,
      name: `${user.name}'s Workspace`
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

export default router;
