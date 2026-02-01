/**
 * Prescription Model
 * Handles database operations for prescription management
 * Manages medications, dosages, refills, and pharmacy integration
 */

const db = require('../database/connection');

class Prescription {
  /**
   * Create a new prescription
   * @param {Object} prescriptionData - Prescription data
   * @returns {Promise<Object>} Created prescription
   */
  static async create(prescriptionData) {
    const {
      consultation_id = null,
      patient_id,
      medication_name,
      dosage,
      frequency = null,
      duration = null,
      quantity = null,
      refills_allowed = 0,
      status = 'active',
      expires_at = null,
    } = prescriptionData;

    const query = `
      INSERT INTO prescriptions (
        consultation_id, patient_id, medication_name, dosage, frequency,
        duration, quantity, refills_allowed, status, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    try {
      const result = await db.query(query, [
        consultation_id,
        patient_id,
        medication_name,
        dosage,
        frequency,
        duration,
        quantity,
        refills_allowed,
        status,
        expires_at,
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  /**
   * Find prescription by ID
   * @param {number} id - Prescription ID
   * @returns {Promise<Object|null>} Prescription or null
   */
  static async findById(id) {
    const query = `
      SELECT p.*, 
             pat.id as patient_id, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email,
             c.id as consultation_id, c.status as consultation_status
      FROM prescriptions p
      JOIN patients pat ON p.patient_id = pat.id
      JOIN users u ON pat.user_id = u.id
      LEFT JOIN consultations c ON p.consultation_id = c.id
      WHERE p.id = $1;
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all prescriptions for a patient
   * @param {number} patientId - Patient ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Patient prescriptions
   */
  static async getPatientPrescriptions(patientId, options = {}) {
    const { status = null, limit = 20, offset = 0 } = options;

    let query = `
      SELECT p.*, c.id as consultation_id
      FROM prescriptions p
      LEFT JOIN consultations c ON p.consultation_id = c.id
      WHERE p.patient_id = $1
    `;

    const params = [patientId];

    if (status) {
      query += ` AND p.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY p.prescribed_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get all prescriptions (with filters)
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} All prescriptions
   */
  static async getAll(options = {}) {
    const { status = null, limit = 50, offset = 0 } = options;

    let query = `
      SELECT p.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM prescriptions p
      JOIN patients pat ON p.patient_id = pat.id
      JOIN users u ON pat.user_id = u.id
    `;

    const params = [];

    if (status) {
      query += ` WHERE p.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY p.prescribed_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Update prescription
   * @param {number} id - Prescription ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated prescription
   */
  static async update(id, updates) {
    const allowedFields = [
      'status',
      'dosage',
      'frequency',
      'duration',
      'quantity',
      'refills_allowed',
      'expires_at',
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
    updateFields.push(`created_at = created_at`); // Keep original creation time

    const query = `
      UPDATE prescriptions
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Request refill for prescription
   * @param {number} id - Prescription ID
   * @returns {Promise<Object>} Updated prescription with refill status
   */
  static async requestRefill(id) {
    // Check if prescription exists and has refills available
    const prescription = await this.findById(id);
    
    if (!prescription) {
      throw new Error('Prescription not found');
    }

    if (prescription.refills_allowed <= 0) {
      throw new Error('No refills remaining. Contact prescriber for new prescription.');
    }

    // Decrement refills and update status
    const query = `
      UPDATE prescriptions
      SET refills_allowed = refills_allowed - 1,
          status = CASE 
            WHEN refills_allowed - 1 = 0 THEN 'expired'
            ELSE 'active'
          END
      WHERE id = $1
      RETURNING *;
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get expired prescriptions
   * @returns {Promise<Array>} Expired prescriptions
   */
  static async getExpired() {
    const query = `
      SELECT p.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM prescriptions p
      JOIN patients pat ON p.patient_id = pat.id
      JOIN users u ON pat.user_id = u.id
      WHERE (p.expires_at IS NOT NULL AND p.expires_at < NOW()) 
         OR (p.refills_allowed = 0 AND p.status = 'expired')
      ORDER BY p.expires_at ASC;
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Search prescriptions by medication name
   * @param {string} query - Search term
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Matching prescriptions
   */
  static async searchByMedication(searchQuery, options = {}) {
    const { limit = 20, offset = 0 } = options;

    const query = `
      SELECT p.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM prescriptions p
      JOIN patients pat ON p.patient_id = pat.id
      JOIN users u ON pat.user_id = u.id
      WHERE LOWER(p.medication_name) LIKE LOWER($1)
      ORDER BY p.prescribed_at DESC
      LIMIT $2 OFFSET $3;
    `;

    const result = await db.query(query, [`%${searchQuery}%`, limit, offset]);
    return result.rows;
  }

  /**
   * Get high-value prescriptions (for billing)
   * @param {number} minCost - Minimum cost threshold
   * @returns {Promise<Array>} High-value prescriptions
   */
  static async getHighValuePrescriptions(minCost = 100) {
    const query = `
      SELECT p.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM prescriptions p
      JOIN patients pat ON p.patient_id = pat.id
      JOIN users u ON pat.user_id = u.id
      WHERE p.status = 'active'
      ORDER BY p.prescribed_at DESC;
    `;

    const result = await db.query(query);
    
    // Filter and sort by estimated cost (quantity * unit_price estimation)
    // This is a placeholder - in production, would have pricing data
    return result.rows;
  }

  /**
   * Cancel prescription
   * @param {number} id - Prescription ID
   * @param {string} reason - Reason for cancellation
   * @returns {Promise<Object>} Cancelled prescription
   */
  static async cancel(id, reason = null) {
    const query = `
      UPDATE prescriptions
      SET status = 'cancelled'
      WHERE id = $1
      RETURNING *;
    `;

    const result = await db.query(query, [id]);
    
    if (!result.rows[0]) {
      throw new Error('Prescription not found');
    }

    return result.rows[0];
  }

  /**
   * Get drug interactions (placeholder for future expansion)
   * @param {Array} medicationNames - Array of medication names
   * @returns {Promise<Array>} Potential interactions
   */
  static async checkDrugInteractions(medicationNames) {
    // Placeholder: In production, would query a drug interaction database
    // For now, return empty array
    return [];
  }

  /**
   * Get medication substitutes (placeholder for future expansion)
   * @param {string} medicationName - Medication name
   * @returns {Promise<Array>} Alternative medications
   */
  static async getMedicationSubstitutes(medicationName) {
    // Placeholder: In production, would query a medication database
    // For now, return empty array
    return [];
  }
}

module.exports = Prescription;
