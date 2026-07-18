import request from 'supertest';
import { app } from '../server/app.js';
import path from 'path';

describe('Data Ingestion Pipeline', () => {
  const workspaceId = 'ws_test_' + Date.now();

  describe('Database / REST API Connection Testing', () => {
    it('should successfully connect with valid mock credentials', async () => {
      const res = await request(app)
        .post('/api/connections')
        .send({
          workspaceId,
          type: 'postgres',
          name: 'Primary DB',
          credentials: {
            host: 'localhost',
            username: 'admin',
            password: 'validpassword'
          }
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.connection).toBeDefined();

      // Verify state update
      const getRes = await request(app).get(`/api/connections/workspace/${workspaceId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.connections.length).toBeGreaterThan(0);
    });

    it('should fail when credentials indicate an auth failure', async () => {
      const res = await request(app)
        .post('/api/connections')
        .send({
          workspaceId,
          type: 'postgres',
          name: 'Primary DB',
          credentials: {
            host: 'localhost',
            username: 'admin',
            password: 'wrong_password'
          }
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Authentication failed');
    });

    it('should simulate a timeout for specific credentials', async () => {
      const res = await request(app)
        .post('/api/connections/test')
        .send({
          type: 'postgres',
          credentials: {
            host: 'localhost',
            username: 'admin',
            password: 'timeout'
          }
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Connection timeout');
    }, 6000); // Allow test to run slightly longer than 5s
  });

  describe('CSV Upload Testing', () => {
    it('should successfully parse a valid CSV and aggregate metrics', async () => {
      const validCsv = Buffer.from('product,price,quantity\nWidget A,10.00,5\nWidget B,20.00,2');

      const res = await request(app)
        .post('/api/connections/upload')
        .field('workspaceId', workspaceId)
        .attach('files', validCsv, { filename: 'products.csv', contentType: 'text/csv' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.files.length).toBe(1);
      
      // Verify metrics aggregated
      expect(res.body.files[0].totalRevenue).toBe(90); // 10*5 + 20*2
      
      // Verify Dashboard connection state updated
      const getRes = await request(app).get(`/api/connections/workspace/${workspaceId}`);
      expect(getRes.status).toBe(200);
      const csvConn = getRes.body.connections.find((c: any) => c.type === 'CSV Upload');
      expect(csvConn).toBeDefined();
    });

    it('should return 400 for a CSV missing required headers', async () => {
      const invalidCsv = Buffer.from('product,cost\nWidget A,10.00'); // Missing 'price' and 'quantity'

      const res = await request(app)
        .post('/api/connections/upload')
        .field('workspaceId', workspaceId)
        .attach('files', invalidCsv, { filename: 'bad_products.csv', contentType: 'text/csv' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Missing required column: 'price'");
    });

    it('should return 400 for malformed CSV row', async () => {
      // Malformed row: unescaped quotes breaking the parser
      const malformedCsv = Buffer.from('product,price,quantity\nWidget A",10,5');

      const res = await request(app)
        .post('/api/connections/upload')
        .field('workspaceId', workspaceId)
        .attach('files', malformedCsv, { filename: 'malformed.csv', contentType: 'text/csv' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Malformed row or parsing error');
    });
  });
});
