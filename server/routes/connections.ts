import { Router } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { mapToNormalizedProduct, extractDataArray } from '../utils/dataMapper';
import { mockRecords } from './mockRecords';


const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// In-memory mock database for connections
export const mockConnections: any[] = [];
export const mockFiles: any[] = [];
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift() as string, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const simulateConnectionTest = async (type: string, credentials: any) => {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Connection timeout (5000ms exceeded)')), 5000)
  );

  const testPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const credsString = JSON.stringify(credentials).toLowerCase();
      
      if (credsString.includes('timeout') || credsString.includes('fail_timeout')) {
        // Do nothing to trigger timeout
        return;
      }
      if (credsString.includes('auth_fail') || credsString.includes('wrong_password')) {
        return reject(new Error('Authentication failed: Invalid credentials provided.'));
      }
      if (credsString.includes('not_found')) {
        return reject(new Error('Database not found: Please check the database name.'));
      }
      if (credsString.includes('refused')) {
        return reject(new Error('Connection refused: The server is not accepting connections.'));
      }
      
      // Basic validation
      if (type === 'postgres' || type === 'mysql' || type === 'PostgreSQL' || type === 'MySQL') {
        if (typeof credentials === 'string') {
           if (!credentials.trim()) return reject(new Error('Missing connection string'));
        } else if (!credentials.host || !credentials.username || !credentials.password) {
          return reject(new Error('Missing required credentials for SQL database'));
        }
      } else if (type === 'mongodb' || type === 'MongoDB') {
        if (typeof credentials === 'string') {
          if (!credentials.trim()) return reject(new Error('Missing Mongo URI'));
        } else if (!credentials.uri) {
          return reject(new Error('Missing Mongo URI'));
        }
      } else if (type === 'rest' || type === 'REST API') {
        if (typeof credentials === 'string') {
          if (!credentials.trim()) return reject(new Error('Missing REST API URL'));
        } else if (!credentials.url) {
          return reject(new Error('Missing REST API URL'));
        }
      } else if (type === 'Supabase') {
        if (typeof credentials === 'object' && (!credentials.url || !credentials.key)) {
          return reject(new Error(`Missing URL or API Key for Supabase`));
        }
        if (credentials.url) {
          let checkUrl = credentials.url.endsWith('/') ? credentials.url.slice(0, -1) : credentials.url;
          fetch(`${checkUrl}/rest/v1/`, {
             headers: {
               'apikey': credentials.key,
               'Authorization': `Bearer ${credentials.key}`
             }
          }).then(async (res) => {
             if (!res.ok && res.status !== 404 && res.status !== 400) { 
               if (res.status === 401 || res.status === 403) {
                 const text = await res.text();
                 reject(new Error(`Supabase connection failed: ${res.status} ${text}`));
               } else {
                 resolve(true);
               }
             } else {
               resolve(true);
             }
          }).catch(err => {
             reject(new Error(`Supabase connection error: ${err.message}`));
          });
          return;
        }
      }
      resolve(true);
    }, 200);
  });

  return Promise.race([testPromise, timeoutPromise]);
};

router.post('/test', async (req, res) => {
  const { type, credentials } = req.body;
  try {
    await simulateConnectionTest(type, credentials);
    res.json({ success: true, message: 'Connection successful!' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { workspaceId, type, name, credentials } = req.body;
  
  if (!workspaceId || !type || !name || !credentials) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await simulateConnectionTest(type, credentials);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }

  const encryptedCredentials = encrypt(JSON.stringify(credentials));
  const newConnection = {
    id: `conn_${Date.now()}`,
    workspaceId,
    type,
    name,
    credentials: encryptedCredentials,
    status: 'connected',
    createdAt: new Date().toISOString()
  };
  mockConnections.push(newConnection);
  res.json({ success: true, connection: { id: newConnection.id, type: newConnection.type, name: newConnection.name, status: newConnection.status } });
});

router.get('/workspace/:workspaceId', (req, res) => {
  const { workspaceId } = req.params;
  const connections = mockConnections.filter(c => c.workspaceId === workspaceId).map(c => ({
    id: c.id,
    type: c.type,
    name: c.name,
    status: c.status
  }));
  res.json({ connections });
});

router.post('/upload', upload.array('files'), (req, res) => {
  const { workspaceId, connectionId } = req.body;
  
  if (!workspaceId) {
    return res.status(400).json({ error: 'Missing workspaceId' });
  }

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const processedFiles = [];
  
  for (const file of files) {
    const isJson = file.originalname.toLowerCase().endsWith('.json') || file.mimetype.includes('json');
    const isCsv = file.originalname.toLowerCase().endsWith('.csv') || file.mimetype.includes('csv') || file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet');

    if (!isJson && !isCsv) {
      return res.status(400).json({ error: `Invalid file type for ${file.originalname}. Only CSV or JSON allowed.` });
    }

    try {
      let records: any[] = [];
      let totalRevenue = 0;
      let totalInventory = 0;
      let validRecordCount = 0;
      let headers: string[] = [];

      if (isCsv) {
        records = parse(file.buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true
        });
        
        if (records.length === 0) {
          return res.status(400).json({ error: `File ${file.originalname} is empty` });
        }
      } else if (isJson) {
        const fileContent = file.buffer.toString('utf-8');
        let parsedData;
        try {
           parsedData = JSON.parse(fileContent);
        } catch (e) {
           return res.status(400).json({ error: `Invalid JSON format in ${file.originalname}.` });
        }
        records = extractDataArray(parsedData);
        if (records.length === 0) {
           return res.status(400).json({ error: `No valid data array found in ${file.originalname}.` });
        }
      }

      let firstValidRecord = null;
      let productMap: Record<string, number> = {};

      for (const rawRecord of records) {
        const normalized = mapToNormalizedProduct(rawRecord);
        if (normalized) {
          if (!firstValidRecord) firstValidRecord = rawRecord;
          validRecordCount++;
          totalRevenue += (normalized.price * normalized.quantity);
          totalInventory += normalized.quantity;
          mockRecords.push({ workspaceId, ...normalized });
          
          if (normalized.product) {
              productMap[normalized.product] = (productMap[normalized.product] || 0) + normalized.quantity;
          }
        }
      }

      const topProducts = Object.entries(productMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(e => e[0]);

      if (validRecordCount === 0) {
         return res.status(400).json({ error: `Upload failed. We couldn't find a column for the product name or other required fields in ${file.originalname}. Please ensure your file has 'product', 'price', and 'quantity' columns.` });
      }

      if (firstValidRecord) {
        headers = Object.keys(firstValidRecord).map(h => h.toLowerCase());
      }

      const schemaDetected = {
        type: file.originalname.toLowerCase().includes('order') ? 'Orders' : 
               file.originalname.toLowerCase().includes('product') ? 'Products' : 
               file.originalname.toLowerCase().includes('customer') ? 'Customers' : 'Unknown',
        columns: headers
      };

      processedFiles.push({
        id: `file_${Date.now()}_${Math.random()}`,
        dataConnectionId: connectionId || `conn_mock_${Date.now()}`,
        workspaceId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        schemaDetected: JSON.stringify(schemaDetected),
        recordCount: validRecordCount,
        totalRevenue: totalRevenue,
        totalInventory: totalInventory,
        topProducts: topProducts
      });
      
    } catch (err: any) {
      return res.status(400).json({ error: `Parsing error in ${file.originalname}. Details: ${err.message}` });
    }
  }

  mockFiles.push(...processedFiles);

  const mockConn = {
    id: `conn_${Date.now()}`,
    workspaceId,
    type: 'Data Upload',
    name: 'Data Uploads',
    credentials: 'mock',
    status: 'connected',
    createdAt: new Date().toISOString()
  };
  mockConnections.push(mockConn);

  res.json({ 
    success: true, 
    files: processedFiles, 
    connection: mockConn,
    message: 'Files uploaded and normalized successfully. Metrics aggregated and workspace updated.' 
  });
});

router.post('/ingest', (req, res) => {
  const { workspaceId, connectionId, payload } = req.body;
  
  if (!workspaceId || !payload) {
    return res.status(400).json({ error: 'Missing workspaceId or payload' });
  }

  let parsedData = payload;
  if (typeof payload === 'string') {
    try {
      parsedData = JSON.parse(payload);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON format in payload.' });
    }
  }

  const records = extractDataArray(parsedData);
  if (records.length === 0) {
     return res.status(400).json({ error: `No valid data array found in the payload.` });
  }

  let totalRevenue = 0;
  let totalInventory = 0;
  let validRecordCount = 0;
  let firstValidRecord = null;
  let productMap: Record<string, number> = {};

  for (const rawRecord of records) {
    const normalized = mapToNormalizedProduct(rawRecord);
    if (normalized) {
      if (!firstValidRecord) firstValidRecord = rawRecord;
      validRecordCount++;
      totalRevenue += (normalized.price * normalized.quantity);
      totalInventory += normalized.quantity;
          mockRecords.push({ workspaceId, ...normalized });
      if (normalized.product) {
          productMap[normalized.product] = (productMap[normalized.product] || 0) + normalized.quantity;
      }
    }
  }

  const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(e => e[0]);

  if (validRecordCount === 0) {
     return res.status(400).json({ error: `Ingestion failed. We couldn't find a column for the product name or other required fields. Please ensure your payload has 'product', 'price', and 'quantity' mapping fields.` });
  }

  const headers = firstValidRecord ? Object.keys(firstValidRecord).map(h => h.toLowerCase()) : [];

  const processedFile = {
    id: `ingest_${Date.now()}_${Math.random()}`,
    dataConnectionId: connectionId || `conn_mock_${Date.now()}`,
    workspaceId,
    fileName: 'REST_API_Ingestion',
    fileSize: JSON.stringify(payload).length,
    fileType: 'application/json',
    schemaDetected: JSON.stringify({ type: 'Unknown', columns: headers }),
    recordCount: validRecordCount,
    totalRevenue: totalRevenue,
    totalInventory: totalInventory,
    topProducts: topProducts
  };

  mockFiles.push(processedFile);

  res.json({ 
    success: true, 
    files: [processedFile], 
    message: 'Payload ingested and normalized successfully.' 
  });
});

router.get('/files', (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId query parameter is required' });
  }
  const userFiles = mockFiles.filter(f => f.workspaceId === workspaceId);
  res.json({ files: userFiles });
});

export default router;
