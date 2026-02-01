/**
 * Fallback User Database
 * Used when PostgreSQL is unavailable
 * Contains hardcoded test credentials for demo/development purposes
 */

// Hashed passwords (bcrypt):
// admin123 -> $2b$10$/YZY95eGl7XYIXJkl7wZXuG4BFbg4v8Rf5Hssl0adLoPvNCeOYcYC
// doctor123 -> $2b$10$6uaueXO2xeazvufeFi77I.q5X/PH8yy82nwBYVmbEgbMU7pn3QISK
// patient123 -> $2b$10$Zv5ZCIZ/XfyYoRwhDxOWXO7r0gZOichI44wCV3/RKQPWU05r/N02e

const fallbackUsers = [
  {
    id: 1,
    email: 'admin@clinic.com',
    password_hash: '$2b$10$/YZY95eGl7XYIXJkl7wZXuG4BFbg4v8Rf5Hssl0adLoPvNCeOYcYC',
    first_name: 'Admin',
    last_name: 'User',
    role: 'administrator',
    status: 'active',
    phone: '555-0001',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15'),
  },
  {
    id: 2,
    email: 'doctor@clinic.com',
    password_hash: '$2b$10$6uaueXO2xeazvufeFi77I.q5X/PH8yy82nwBYVmbEgbMU7pn3QISK',
    first_name: 'Dr. John',
    last_name: 'Smith',
    role: 'doctor',
    status: 'active',
    phone: '555-0002',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15'),
  },
  {
    id: 3,
    email: 'nurse@clinic.com',
    password_hash: '$2b$10$OqB7.jKa3l/8nL6pM2uP5.nV9T0xR8sK1wQ9zY2aB3cD4eF5gH6iI',
    first_name: 'Rachel',
    last_name: 'Johnson',
    role: 'nurse',
    status: 'active',
    phone: '555-0003',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15'),
  },
  {
    id: 4,
    email: 'patient@clinic.com',
    password_hash: '$2b$10$Zv5ZCIZ/XfyYoRwhDxOWXO7r0gZOichI44wCV3/RKQPWU05r/N02e',
    first_name: 'John',
    last_name: 'Doe',
    role: 'patient',
    status: 'active',
    phone: '555-0004',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15'),
  },
];

// Mock in-memory storage for patients and other data
const fallbackDatabase = {
  users: fallbackUsers,
  patients: [
    {
      id: 1,
      user_id: 4,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '9876543210',
      date_of_birth: '1990-05-15',
      gender: 'male',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62701',
      medical_history: 'Hypertension',
      created_at: new Date('2025-01-20'),
      updated_at: new Date('2025-01-20'),
    },
    {
      id: 2,
      user_id: null,
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      phone: '9876543211',
      date_of_birth: '1985-08-22',
      gender: 'female',
      address: '456 Oak Ave',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62701',
      medical_history: 'Diabetes',
      created_at: new Date('2025-01-20'),
      updated_at: new Date('2025-01-20'),
    },
    {
      id: 3,
      user_id: null,
      first_name: 'Robert',
      last_name: 'Johnson',
      email: 'robert@example.com',
      phone: '9876543212',
      date_of_birth: '1995-03-10',
      gender: 'male',
      address: '789 Pine Rd',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62701',
      medical_history: null,
      created_at: new Date('2025-01-20'),
      updated_at: new Date('2025-01-20'),
    },
  ],
  appointments: [],
  consultations: [],
  prescriptions: [],
  labs: [],
  invoices: [],
  payments: [],
};

module.exports = {
  fallbackUsers,
  fallbackDatabase,
  findUserByEmail(email) {
    return fallbackDatabase.users.find(u => u.email === email) || null;
  },
  findUserById(id) {
    return fallbackDatabase.users.find(u => u.id === id) || null;
  },
  getAllPatients() {
    return fallbackDatabase.patients;
  },
  getPatientById(id) {
    return fallbackDatabase.patients.find(p => p.id === id) || null;
  },
  getPatientByFirstName(name) {
    return fallbackDatabase.patients.filter(p => 
      p.first_name.toLowerCase().includes(name.toLowerCase())
    );
  },
  getAllAppointments() {
    return fallbackDatabase.appointments;
  },
  getAllConsultations() {
    return fallbackDatabase.consultations;
  },
  getAllPrescriptions() {
    return fallbackDatabase.prescriptions;
  },
  getAllLabs() {
    return fallbackDatabase.labs;
  },
  getAllInvoices() {
    return fallbackDatabase.invoices;
  },
  // Generic add method for any collection
  addRecord(collection, record) {
    if (!fallbackDatabase[collection]) {
      fallbackDatabase[collection] = [];
    }
    const id = Math.max(0, ...fallbackDatabase[collection].map(r => r.id || 0)) + 1;
    record.id = id;
    fallbackDatabase[collection].push(record);
    return record;
  },
};
