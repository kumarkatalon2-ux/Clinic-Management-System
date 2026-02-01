/**
 * Patient Model
 * Handles database operations for patient management
 */

const db = require('../database/connection');
const fallback = require('../database/fallback-users');

// Helper function to safely parse JSON fields
function safeParseJSON(value) {
  if (!value || value === null || value === 'None' || value === 'undefined') {
    return [];
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return [];
  }
}

class Patient {
  /**
   * Create a new patient record
   * @param {Object} patientData - Patient data
   * @returns {Promise<Object>} Created patient
   */
  static async create(patientData) {
    const {
      user_id,
      mrn,
      date_of_birth,
      gender,
      blood_type,
      allergies = [],
      medical_conditions = [],
      insurance_provider = null,
      insurance_policy_number = null,
      emergency_contact_name = null,
      emergency_contact_phone = null,
    } = patientData;

    try {
      const query = `
        INSERT INTO patients (
          user_id, mrn, date_of_birth, gender, blood_type, allergies, medical_conditions,
          insurance_provider, insurance_policy_number, emergency_contact_name, emergency_contact_phone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;

      const result = await db.query(query, [
        user_id,
        mrn,
        date_of_birth,
        gender,
        blood_type,
        JSON.stringify(allergies),
        JSON.stringify(medical_conditions),
        insurance_provider,
        insurance_policy_number,
        emergency_contact_name,
        emergency_contact_phone,
      ]);

      const patient = result.rows[0];
      patient.allergies = JSON.parse(patient.allergies);
      patient.medical_conditions = JSON.parse(patient.medical_conditions);

      return patient;
    } catch (error) {
      console.warn('⚠️  Database unavailable, using fallback patient creation');
      
      // Fallback: create in-memory patient
      const newPatient = {
        id: Math.max(0, ...fallback.fallbackDatabase.patients.map(p => p.id)) + 1,
        user_id,
        mrn,
        date_of_birth,
        gender,
        blood_type,
        allergies,
        medical_conditions,
        insurance_provider,
        insurance_policy_number,
        emergency_contact_name,
        emergency_contact_phone,
        created_at: new Date(),
        updated_at: new Date(),
      };

      fallback.fallbackDatabase.patients.push(newPatient);
      return newPatient;
    }
  }

  /**
   * Get all patients with pagination
   * @param {Object} options - Options for pagination
   * @returns {Promise<Array>} Array of patients
   */
  static async getAll(options = {}) {
    const { limit = 50, offset = 0 } = options;

    const query = `
      SELECT p.id, p.user_id, p.mrn, p.date_of_birth, p.gender, p.blood_type, p.allergies, 
             p.medical_conditions, p.insurance_provider, p.insurance_policy_number,
             p.emergency_contact_name, p.emergency_contact_phone, p.created_at, p.updated_at,
             u.email, u.first_name, u.last_name, u.phone
      FROM patients p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    try {
      const result = await db.query(query, [limit, offset]);
      
      return result.rows.map(patient => {
        try {
          if (patient.allergies && patient.allergies !== 'None' && patient.allergies !== null) {
            patient.allergies = JSON.parse(patient.allergies);
          } else {
            patient.allergies = [];
          }
        } catch (e) {
          patient.allergies = [];
        }
        try {
          if (patient.medical_conditions && patient.medical_conditions !== 'None' && patient.medical_conditions !== null) {
            patient.medical_conditions = JSON.parse(patient.medical_conditions);
          } else {
            patient.medical_conditions = [];
          }
        } catch (e) {
          patient.medical_conditions = [];
        }
        return patient;
      });
    } catch (error) {
      console.error('Error fetching all patients:', error);
      console.warn('⚠️ Database unavailable, using fallback...');
      // Return fallback patients
      return fallback.fallbackDatabase.patients || [];
    }
  }

  /**
   * Find patient by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Patient object or null
   */
  static async findByUserId(userId) {
    const query = `
      SELECT *
      FROM patients
      WHERE user_id = $1;
    `;

    const result = await db.query(query, [userId]);
    if (!result.rows[0]) return null;

    const patient = result.rows[0];
    patient.allergies = safeParseJSON(patient.allergies);
    patient.medical_conditions = safeParseJSON(patient.medical_conditions);

    return patient;
  }

  /**
   * Find patient by ID
   * @param {number} id - Patient ID
   * @returns {Promise<Object|null>} Patient object or null
   */
  static async findById(id) {
    const query = `
      SELECT *
      FROM patients
      WHERE id = $1;
    `;

    const result = await db.query(query, [id]);
    if (!result.rows[0]) return null;

    const patient = result.rows[0];
    patient.allergies = safeParseJSON(patient.allergies);
    patient.medical_conditions = safeParseJSON(patient.medical_conditions);

    return patient;
  }

  /**
   * Find patient by MRN
   * @param {string} mrn - Medical Record Number
   * @returns {Promise<Object|null>} Patient object or null
   */
  static async findByMRN(mrn) {
    const query = `
      SELECT *
      FROM patients
      WHERE mrn = $1;
    `;

    const result = await db.query(query, [mrn]);
    if (!result.rows[0]) return null;

    const patient = result.rows[0];
    patient.allergies = safeParseJSON(patient.allergies);
    patient.medical_conditions = safeParseJSON(patient.medical_conditions);

    return patient;
  }

  /**
   * Get patient with user information
   * @param {number} id - Patient ID
   * @returns {Promise<Object|null>} Patient with user data
   */
  static async getWithUser(id) {
    const query = `
      SELECT p.*, u.email, u.first_name, u.last_name, u.phone
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1;
    `;

    const result = await db.query(query, [id]);
    if (!result.rows[0]) return null;

    const patient = result.rows[0];
    patient.allergies = safeParseJSON(patient.allergies);
    patient.medical_conditions = safeParseJSON(patient.medical_conditions);

    return patient;
  }

  /**
   * Update patient
   * @param {number} id - Patient ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated patient
   */
  static async update(id, updates) {
    const allowedFields = [
      'mrn',
      'date_of_birth',
      'gender',
      'blood_type',
      'allergies',
      'medical_conditions',
      'insurance_provider',
      'insurance_policy_number',
      'emergency_contact_name',
      'emergency_contact_phone',
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'allergies' || key === 'medical_conditions') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE patients
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await db.query(query, values);
    if (!result.rows[0]) return null;

    const patient = result.rows[0];
    patient.allergies = JSON.parse(patient.allergies);
    patient.medical_conditions = JSON.parse(patient.medical_conditions);

    return patient;
  }

  /**
   * List all patients
   * @param {number} limit - Limit results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Object>} Patients list and total count
   */
  static async listPatients(limit = 10, offset = 0) {
    const query = `
      SELECT p.id, p.user_id, p.mrn, p.date_of_birth, p.gender, p.blood_type,
             u.email, u.first_name, u.last_name, u.phone, p.created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `SELECT COUNT(*) as total FROM patients;`;

    const [patients, countResult] = await Promise.all([
      db.query(query, [limit, offset]),
      db.query(countQuery),
    ]);

    return {
      patients: patients.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    };
  }

  /**
   * Get patient statistics
   * @returns {Promise<Object>} Patient statistics
   */
  static async getStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_patients,
        COUNT(CASE WHEN dob > NOW() - INTERVAL '18 years' THEN 1 END) as patients_under_18,
        COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_patients,
        COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_patients,
        AVG(EXTRACT(YEAR FROM age(dob))) as average_age
      FROM patients;
    `;

    const result = await db.query(query);
    return result.rows[0];
  }

  /**
   * Delete patient (soft delete)
   * @param {number} id - Patient ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    const query = `
      UPDATE patients
      SET deleted_at = NOW()
      WHERE id = $1;
    `;

    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }
}

module.exports = Patient;
