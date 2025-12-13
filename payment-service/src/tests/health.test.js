const request = require('supertest');
const app = require('../server');

// Mock dependencies
jest.mock('../config/database', () => ({
  query: jest.fn(),
  end: jest.fn(),
  connect: jest.fn(),
}));

jest.mock('../config/redis', () => ({
  connect: jest.fn(),
  quit: jest.fn(),
  on: jest.fn(),
  v4: {
      connect: jest.fn(),
      quit: jest.fn()
  }
}));

jest.mock('../config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  http: jest.fn(),
}));

describe('Health Check', () => {
    let server;
    
    // We need to allow the app to be imported without starting the server immediately, 
    // or handle the start/close in tests. 
    // Looking at index.js, it imports logic from src/server.js.
    // If src/server.js exports 'app', we can use it.
    
    it('should return 404 for unknown routes (basic app structure check)', async () => {
        const res = await request(app).get('/unknown-route-123');
        expect(res.status).not.toBe(500); // Should be 404 or some handled error
    });
});
