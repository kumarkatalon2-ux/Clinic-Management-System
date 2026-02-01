/**
 * Consultation Model
 * Handles database operations for consultation management
 * Matches existing database schema
 */

const db = require('../database/connection');

class Consultation {
  /**
   * Create a new consultation
   * @param {Object} consultationData - Consultation data
   * @returns {Promise<Object>} Created consultation
   */
  static async create(consultationData) {
    const {
      patient_id,
      provider_id,
      appointment_id = null,
      consultation_type,
      status = 'scheduled',
      start_time,
      end_time = null,
      chief_complaint = null,
      history_of_present_illness = null,
      physical_examination = null,
      assessment = null,
      plan = null,
      medications = null,
      follow_up_instructions = null,
    } = consultationData;

    const query = `
      INSERT INTO consultations (
        patient_id, provider_id, appointment_id, consultation_type, status,
        start_time, end_time, chief_complaint, history_of_present_illness,
        physical_examination, assessment, plan, medications, follow_up_instructions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;

    try {
      const result = await db.query(query, [
        patient_id,
        provider_id,
        appointment_id,
        consultation_type,
        status,
        start_time,
        end_time,
        chief_complaint,
        history_of_present_illness,
        physical_examination,
        assessment,
        plan,
        medications,
        follow_up_instructions,
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  }

  /**
   * Find consultation by ID
   * @param {number} id - Consultation ID
   * @returns {Promise<Object|null>} Consultation or null
   */
  static async findById(id) {
    const query = `
      SELECT c.*, 
             p.id as patient_id, u1.first_name as patient_first_name, u1.last_name as patient_last_name, u1.email as patient_email,
             u2.first_name as provider_first_name, u2.last_name as provider_last_name, u2.email as provider_email,
             a.appointment_type, a.location
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      JOIN users u2 ON c.provider_id = u2.id
      LEFT JOIN appointments a ON c.appointment_id = a.id
      WHERE c.id = $1;
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get consultations for patient
   * @param {number} patientId - Patient ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Patient consultations
   */
  static async getPatientConsultations(patientId, options = {}) {
    const { status = null, limit = 10, offset = 0 } = options;

    let query = `
      SELECT c.*, u.email as provider_email, u.first_name as provider_first_name, u.last_name as provider_last_name
      FROM consultations c
      JOIN users u ON c.provider_id = u.id
      WHERE c.patient_id = $1
    `;

    const params = [patientId];

    if (status) {
      query += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get consultations for provider/doctor
   * @param {number} providerId - Provider/Doctor ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Provider consultations
   */
  static async getProviderConsultations(providerId, options = {}) {
    const { status = null, limit = 10, offset = 0 } = options;

    let query = `
      SELECT c.*, u.email as patient_email, u.first_name as patient_first_name, u.last_name as patient_last_name
      FROM consultations c
      JOIN users u ON c.patient_id = u.id
      WHERE c.provider_id = $1
    `;

    const params = [providerId];

    if (status) {
      query += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Update consultation
   * @param {number} id - Consultation ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated consultation
   */
  static async update(id, updates) {
    const allowedFields = [
      'status',
      'end_time',
      'chief_complaint',
      'history_of_present_illness',
      'physical_examination',
      'assessment',
      'plan',
      'medications',
      'follow_up_instructions',
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE consultations
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all consultations with optional filters
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} All consultations
   */
  static async getAll(options = {}) {
    const { limit = 50, offset = 0, status = null } = options;

    let query = `
      SELECT c.*, p.id as patient_id, u1.email as patient_email,
             u2.email as provider_email, u2.first_name as provider_first_name, u2.last_name as provider_last_name
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      JOIN users u2 ON c.provider_id = u2.id
    `;

    const params = [];

    if (status) {
      query += ` WHERE c.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Cancel consultation
   * @param {number} id - Consultation ID
   * @returns {Promise<Object>} Cancelled consultation
   */
  static async cancel(id) {
    const query = `
      UPDATE consultations
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1 AND status != 'completed'
      RETURNING *;
    `;

    const result = await db.query(query, [id]);
    if (!result.rows[0]) {
      throw new Error('Consultation not found or cannot be cancelled');
    }

    return result.rows[0];
  }
}

module.exports = Consultation;
