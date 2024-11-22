import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'turnos.db'));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Enhanced Database Initialization with More Detailed Categories
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    type TEXT NOT NULL,  -- Added type to categorize ticket nature
    estimated_service_time INTEGER DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT NOT NULL,
    category_id INTEGER,
    status TEXT DEFAULT 'waiting',
    sub_status TEXT,  -- Added sub_status for more granular tracking
    counter INTEGER,
    priority INTEGER DEFAULT 0,
    estimated_time INTEGER,
    complexity INTEGER DEFAULT 1,  -- Complexity factor for service time
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    customer_name TEXT,
    contact_info TEXT,
    additional_notes TEXT,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );

  -- Comprehensive Service Categories
  INSERT OR IGNORE INTO categories (id, name, prefix, priority, type, estimated_service_time) VALUES
    -- Customer Service Categories
    (1, 'Consulta General', 'CG', 0, 'information', 10),
    (2, 'Servicio Preferencial', 'SP', 1, 'priority', 15),
    
    -- Account Management
    (10, 'Alta de Servicio', 'AS', 0, 'onboarding', 20),
    (11, 'Baja de Servicio', 'BS', 0, 'termination', 15),
    (12, 'Cambio de Plan', 'CP', 0, 'modification', 25),
    
    -- Billing and Payments
    (20, 'Consulta de Facturación', 'CF', 0, 'billing', 15),
    (21, 'Problemas de Pago', 'PP', 0, 'payment', 20),
    (22, 'Reembolso', 'RF', 1, 'refund', 25),
    
    -- Technical Support
    (30, 'Soporte Técnico Básico', 'ST', 0, 'tech_support', 20),
    (31, 'Problemas de Conexión', 'PC', 0, 'network', 25),
    (32, 'Reparación de Equipo', 'RE', 1, 'hardware', 35),
    
    -- Complaints and Claims
    (40, 'Reclamo de Servicio', 'RC', 1, 'complaint', 25),
    (41, 'Insatisfacción', 'IS', 1, 'customer_experience', 20),
    (42, 'Solicitud de Compensación', 'SC', 2, 'compensation', 30)
`);

app.use(cors());
app.use(express.json());

// Improved Ticket Number Generation
function getNextNumber(prefix, currentDate) {
  const stmt = db.prepare(`
    SELECT number 
    FROM tickets 
    WHERE number LIKE ? AND DATE(created_at) = DATE(?)
    ORDER BY id DESC LIMIT 1
  `);
  const lastTicket = stmt.get(`${prefix}%`, currentDate);
  
  if (!lastTicket) {
    return `${prefix}001`;
  }
  
  const lastNumber = parseInt(lastTicket.number.slice(prefix.length));
  if (isNaN(lastNumber)) {
    console.error('Invalid last ticket number:', lastTicket.number);
    return `${prefix}001`;
  }
  
  const nextNumber = lastNumber + 1;
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

// Enhanced Ticket Creation
app.post('/api/tickets', (req, res) => {
  const { 
    categoryId = 1, 
    customerName = '',
    contactInfo = '',
    additionalNotes = '',
    complexityFactor = 1
  } = req.body;
  
  const currentDate = new Date().toISOString();
  
  console.log('Creating ticket with categoryId:', categoryId);
  
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
  
  if (!category) {
    console.error(`Category with ID ${categoryId} not found`);
    return res.status(404).json({ 
      error: 'Category not found', 
      message: `No category exists with ID ${categoryId}` 
    });
  }
  
  const ticketNumber = getNextNumber(category.prefix, currentDate);
  
  const estimatedTime = Math.max(
    category.estimated_service_time * complexityFactor, 
    10
  );
  
  const stmt = db.prepare(`
    INSERT INTO tickets (
      number, category_id, priority, estimated_time, 
      complexity, customer_name, contact_info, additional_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    ticketNumber, 
    categoryId, 
    category.priority, 
    estimatedTime,
    complexityFactor,
    customerName,
    contactInfo,
    additionalNotes
  );
  
  const ticket = db.prepare(`
    SELECT t.*, c.name as category_name, c.prefix, c.type
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);
  
  console.log('Created ticket:', ticket);
  
  io.emit('newTicket', ticket);
  res.json(ticket);
});

// Enhanced Ticket Retrieval
app.get('/api/tickets', (req, res) => {
  const { type, status, priority } = req.query;
  
  let query = `
    SELECT t.*, c.name as category_name, c.prefix, c.type
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    WHERE DATE(t.created_at) = DATE('now')
  `;
  
  const conditions = [];
  const params = [];
  
  if (type) {
    conditions.push('c.type = ?');
    params.push(type);
  }
  
  if (status) {
    conditions.push('t.status = ?');
    params.push(status);
  }
  
  if (priority) {
    conditions.push('t.priority = ?');
    params.push(priority);
  }
  
  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }
  
  query += `
    ORDER BY 
      CASE t.status
        WHEN 'waiting' THEN 1
        WHEN 'serving' THEN 2
        WHEN 'completed' THEN 3
      END,
      t.priority DESC,
      t.created_at ASC
  `;
  
  const tickets = db.prepare(query).all(...params);
  res.json(tickets);
});

// Enhanced Ticket Update
app.put('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const { 
    status, 
    counter, 
    subStatus,
    resolutionNotes = ''
  } = req.body;
  
  const stmt = db.prepare(`
    UPDATE tickets 
    SET 
      status = ?, 
      counter = ?, 
      sub_status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(status, counter, subStatus, id);
  
  const ticket = db.prepare(`
    SELECT t.*, c.name as category_name, c.prefix, c.type
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `).get(id);
  
  io.emit('ticketUpdate', ticket);
  res.json(ticket);
});

// Enhanced Ticket Retrieval with More Filtering Options
app.get('/api/tickets', (req, res) => {
  const { type, status, priority } = req.query;
  
  let query = `
    SELECT t.*, c.name as category_name, c.prefix, c.type
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    WHERE DATE(t.created_at) = DATE('now')
  `;
  
  const conditions = [];
  const params = [];
  
  if (type) {
    conditions.push('c.type = ?');
    params.push(type);
  }
  
  if (status) {
    conditions.push('t.status = ?');
    params.push(status);
  }
  
  if (priority) {
    conditions.push('t.priority = ?');
    params.push(priority);
  }
  
  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }
  
  query += `
    ORDER BY 
      CASE t.status
        WHEN 'waiting' THEN 1
        WHEN 'serving' THEN 2
        WHEN 'completed' THEN 3
      END,
      t.priority DESC,
      t.created_at ASC
  `;
  
  const tickets = db.prepare(query).all(...params);
  res.json(tickets);
});

// Enhanced Ticket Update with More Status Options
app.put('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const { 
    status, 
    counter, 
    subStatus,
    resolutionNotes = ''
  } = req.body;
  
  const stmt = db.prepare(`
    UPDATE tickets 
    SET 
      status = ?, 
      counter = ?, 
      sub_status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(status, counter, subStatus, id);
  
  const ticket = db.prepare(`
    SELECT t.*, c.name as category_name, c.prefix, c.type
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `).get(id);
  
  io.emit('ticketUpdate', ticket);
  res.json(ticket);
});

// New endpoint to fetch categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        id, 
        name, 
        prefix, 
        type, 
        priority, 
        estimated_service_time AS estimatedServiceTime 
      FROM categories
    `).all();
    
    // Add a description for each category to match the frontend's expectations
    const categoriesWithDescription = categories.map(category => ({
      ...category,
      description: getCategoryDescription(category.id)
    }));
    
    res.json(categoriesWithDescription);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate category descriptions
function getCategoryDescription(categoryId) {
  const descriptions = {
    1: 'Consulta general para información básica',
    2: 'Servicio preferencial con atención prioritaria',
    10: 'Proceso de alta de nuevo servicio',
    11: 'Solicitud de baja de servicio',
    12: 'Cambio de plan o modificación de servicio',
    20: 'Consultas relacionadas con facturación',
    21: 'Problemas o dudas con pagos',
    22: 'Solicitud de reembolso',
    30: 'Soporte técnico básico',
    31: 'Problemas de conexión o red',
    32: 'Reparación de equipamiento',
    40: 'Presentación formal de reclamo de servicio',
    41: 'Manifestación de insatisfacción con el servicio',
    42: 'Solicitud de compensación por inconvenientes'
  };
  
  return descriptions[categoryId] || 'Categoría de servicio';
}

// Enhanced Statistics Endpoint
app.get('/api/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const stats = db.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'waiting' THEN 1 END) as waiting_count,
        COUNT(CASE WHEN status = 'serving' THEN 1 END) as serving_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN c.type = 'billing' THEN 1 END) as billing_tickets,
        COUNT(CASE WHEN c.type = 'tech_support' THEN 1 END) as tech_support_tickets,
        COUNT(CASE WHEN c.type = 'complaint' THEN 1 END) as complaint_tickets,
        ROUND(AVG(
          CASE 
            WHEN status = 'completed' 
            THEN (julianday(updated_at) - julianday(created_at)) * 24 * 60 
            ELSE 0 
          END
        ), 2) as avg_wait_time,
        COUNT(CASE WHEN t.priority = 1 THEN 1 END) as priority_tickets,
        COUNT(CASE WHEN t.priority = 2 THEN 1 END) as high_priority_tickets
      FROM tickets t
      JOIN categories c ON t.category_id = c.id
      WHERE DATE(t.created_at) = ?
    `).get(today);

    const safeStats = {
      waiting_count: stats.waiting_count || 0,
      serving_count: stats.serving_count || 0,
      completed_count: stats.completed_count || 0,
      billing_tickets: stats.billing_tickets || 0,
      tech_support_tickets: stats.tech_support_tickets || 0,
      complaint_tickets: stats.complaint_tickets || 0,
      avg_wait_time: stats.avg_wait_time || 0,
      priority_tickets: stats.priority_tickets || 0,
      high_priority_tickets: stats.high_priority_tickets || 0
    };

    res.json(safeStats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

const allCategories = db.prepare('SELECT * FROM categories').all();
console.log('Existing categories:', allCategories);

// Socket.IO events with Enhanced Logging
io.on('connection', (socket) => {
  console.log('Client connected', {
    timestamp: new Date().toISOString(),
    connectionId: socket.id
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected', {
      timestamp: new Date().toISOString(),
      connectionId: socket.id
    });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});