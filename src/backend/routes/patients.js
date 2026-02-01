/**
 * Patient Routes
 * CRUD operations for patient management
 * 
 * GET    /api/patients - List all patients
 * GET    /api/patients/:id - Get patient by ID
 * POST   /api/patients - Create new patient
 * PUT    /api/patients/:id - Update patient
 * DELETE /api/patients/:id - Delete patient
 */

const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to verify JWT token
 */
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
    });
  }
};

/**
 * Middleware to check admin/doctor role
 */
const requireAdminOrDoctor = (req, res, next) => {
  if (req.user.role !== 'administrator' && req.user.role !== 'doctor') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only administrators and doctors can manage patients',
    });
  }
  next();
};

// ============================================
// LIST ALL PATIENTS - GET /api/patients
// ============================================
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('📋 LISTING PATIENTS');

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get all patients with pagination
    const patients = await Patient.getAll({ limit: parseInt(limit), offset });

    console.log(`✅ Retrieved ${patients.length} patients`);

    res.status(200).json({
      message: 'Patients retrieved successfully',
      data: {
        patients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: patients.length,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error listing patients:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// SEARCH PATIENTS - GET /api/patients/search/query
// ============================================
router.get('/search/:query', requireAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const { type = 'any' } = req.query; // 'id', 'name', 'mobile', or 'any'
    
    console.log(`🔍 SEARCHING PATIENTS - ${type}: ${query}`);

    const db = require('../database/connection');
    let searchQuery = `
      SELECT p.*, u.email, u.first_name, u.last_name, u.phone as mobile
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE 
    `;
    const params = [];

    if (type === 'id' || type === 'any') {
      // Search by patient ID (exact match)
      const result = await db.query(`
        SELECT p.*, u.email, u.first_name, u.last_name, u.phone as mobile
        FROM patients p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $1 OR u.id = $1
      `, [parseInt(query) || 0]);
      
      if (result.rows.length > 0) {
        return res.status(200).json({
          message: 'Patient found',
          data: result.rows,
        });
      }
    }

    if (type === 'name' || type === 'any') {
      // Search by name (contains)
      params.push(`%${query}%`);
      const result = await db.query(`
        SELECT p.*, u.email, u.first_name, u.last_name, u.phone as mobile
        FROM patients p
        JOIN users u ON p.user_id = u.id
        WHERE CONCAT(u.first_name, ' ', u.last_name) ILIKE $1
        LIMIT 10
      `, params);
      
      if (result.rows.length > 0) {
        return res.status(200).json({
          message: 'Patients found by name',
          data: result.rows,
        });
      }
    }

    if (type === 'mobile' || type === 'any') {
      // Search by mobile (contains)
      params.push(`%${query}%`);
      const result = await db.query(`
        SELECT p.*, u.email, u.first_name, u.last_name, u.phone as mobile
        FROM patients p
        JOIN users u ON p.user_id = u.id
        WHERE u.phone ILIKE $1
        LIMIT 10
      `, params);
      
      if (result.rows.length > 0) {
        return res.status(200).json({
          message: 'Patients found by mobile',
          data: result.rows,
        });
      }
    }

    // No results found
    res.status(404).json({
      message: 'No patients found',
      data: [],
    });
  } catch (error) {
    console.error('❌ Error searching patients:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// GET PATIENT BY ID - GET /api/patients/:id
// ============================================
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 FETCHING PATIENT ${id}`);

    const patient = await Patient.findById(parseInt(id));

    if (!patient) {
      console.log(`❌ Patient not found: ${id}`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Patient not found',
      });
    }

    console.log(`✅ Patient retrieved: ${patient.id}`);

    res.status(200).json({
      message: 'Patient retrieved successfully',
      data: { patient },
    });
  } catch (error) {
    console.error('❌ Error fetching patient:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// CREATE PATIENT - POST /api/patients
// ============================================
router.post('/', requireAuth, requireAdminOrDoctor, async (req, res) => {
  try {
    console.log('📝 CREATING NEW PATIENT');

    const {
      user_id,
      mrn,
      dob,
      gender,
      blood_type,
      allergies,
      medical_conditions,
      insurance_provider,
      insurance_member_id,
      emergency_contact_name,
      emergency_contact_phone,
    } = req.body;

    // Validate required fields
    if (!user_id || !mrn || !dob || !gender) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'user_id, mrn, dob, and gender are required',
      });
    }

    // Validate gender
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'gender must be male, female, or other',
      });
    }

    // Validate blood type
    const validBloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    if (blood_type && !validBloodTypes.includes(blood_type)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid blood type',
      });
    }

    // Create patient
    const patient = await Patient.create({
      user_id,
      mrn,
      dob,
      gender: gender.toLowerCase(),
      blood_type,
      allergies: allergies || [],
      medical_conditions: medical_conditions || [],
      insurance_provider,
      insurance_member_id,
      emergency_contact_name,
      emergency_contact_phone,
    });

    console.log(`✅ Patient created: ${patient.id}`);

    res.status(201).json({
      message: 'Patient created successfully',
      data: { patient },
    });
  } catch (error) {
    console.error('❌ Error creating patient:', error);

    if (error.message.includes('MRN already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'MRN already exists',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// UPDATE PATIENT - PUT /api/patients/:id
// ============================================
router.put('/:id', requireAuth, requireAdminOrDoctor, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️  UPDATING PATIENT ${id}`);

    // Check if patient exists
    const existingPatient = await Patient.findById(parseInt(id));
    if (!existingPatient) {
      console.log(`❌ Patient not found: ${id}`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Patient not found',
      });
    }

    // Update patient
    const updatedPatient = await Patient.update(parseInt(id), req.body);

    console.log(`✅ Patient updated: ${id}`);

    res.status(200).json({
      message: 'Patient updated successfully',
      data: { patient: updatedPatient },
    });
  } catch (error) {
    console.error('❌ Error updating patient:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// DELETE PATIENT - DELETE /api/patients/:id
// ============================================
router.delete('/:id', requireAuth, requireAdminOrDoctor, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  DELETING PATIENT ${id}`);

    // Check if patient exists
    const existingPatient = await Patient.findById(parseInt(id));
    if (!existingPatient) {
      console.log(`❌ Patient not found: ${id}`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Patient not found',
      });
    }

    // Delete patient
    const deleted = await Patient.delete(parseInt(id));

    if (!deleted) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete patient',
      });
    }

    console.log(`✅ Patient deleted: ${id}`);

    res.status(200).json({
      message: 'Patient deleted successfully',
      data: {
        id: parseInt(id),
      },
    });
  } catch (error) {
    console.error('❌ Error deleting patient:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

module.exports = router;
