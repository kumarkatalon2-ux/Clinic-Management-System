/**
 * Lab Test Model
 * Handles database operations for lab test management
 * Manages test ordering, result tracking, and reporting
 */

const db = require('../database/connection');

class LabTest {
  /**
   * Create a new lab test order
   * @param {Object} testData - Lab test data
   * @returns {Promise<Object>} Created lab test
   */
  static async create(testData) {
    const {
      patient_id,
      provider_id,
      test_name,
      test_category,
      status = 'ordered',
      notes = null,
    } = testData;

    const query = `
      INSERT INTO lab_tests (
        patient_id, provider_id, test_name, test_category, status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    try {
      const result = await db.query(query, [
        patient_id,
        provider_id,
        test_name,
        test_category,
        status,
        notes,
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating lab test:', error);
      throw error;
    }
  }

  /**
   * Find lab test by ID
   * @param {number} id - Lab test ID
   * @returns {Promise<Object|null>} Lab test or null
   */
  static async findById(id) {
    const query = `
      SELECT lt.*,
             p.id as patient_id, u1.first_name as patient_first_name, u1.last_name as patient_last_name, u1.email as patient_email,
             u2.first_name as provider_first_name, u2.last_name as provider_last_name, u2.email as provider_email
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      LEFT JOIN users u2 ON lt.provider_id = u2.id
      WHERE lt.id = $1;
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all lab tests for a patient
   * @param {number} patientId - Patient ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Patient lab tests
   */
  static async getPatientTests(patientId, options = {}) {
    const { status = null, limit = 20, offset = 0 } = options;

    let query = `
      SELECT lt.*, u.first_name as provider_first_name, u.last_name as provider_last_name, u.email as provider_email
      FROM lab_tests lt
      LEFT JOIN users u ON lt.provider_id = u.id
      WHERE lt.patient_id = $1
    `;

    const params = [patientId];

    if (status) {
      query += ` AND lt.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY lt.ordered_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get all lab tests (with filters)
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} All lab tests
   */
  static async getAll(options = {}) {
    const { status = null, limit = 50, offset = 0 } = options;

    let query = `
      SELECT lt.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      JOIN users u ON p.user_id = u.id
    `;

    const params = [];

    if (status) {
      query += ` WHERE lt.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY lt.ordered_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Update lab test
   * @param {number} id - Lab test ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated lab test
   */
  static async update(id, updates) {
    const allowedFields = [
      'status',
      'collected_at',
      'result_received_at',
      'result_value',
      'result_unit',
      'reference_range',
      'abnormal',
      'notes',
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

    const query = `
      UPDATE lab_tests
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Record lab result (collected and received)
   * @param {number} id - Lab test ID
   * @param {Object} resultData - Result data
   * @returns {Promise<Object>} Updated lab test
   */
  static async recordResult(id, resultData) {
    const {
      result_value,
      result_unit,
      reference_range,
      abnormal = false,
      notes = null,
    } = resultData;

    const query = `
      UPDATE lab_tests
      SET status = 'completed',
          result_received_at = NOW(),
          collected_at = COALESCE(collected_at, NOW()),
          result_value = $1,
          result_unit = $2,
          reference_range = $3,
          abnormal = $4,
          notes = $5
      WHERE id = $6
      RETURNING *;
    `;

    const result = await db.query(query, [
      result_value,
      result_unit,
      reference_range,
      abnormal,
      notes,
      id,
    ]);

    if (!result.rows[0]) {
      throw new Error('Lab test not found');
    }

    return result.rows[0];
  }

  /**
   * Get abnormal results
   * @returns {Promise<Array>} Abnormal lab results
   */
  static async getAbnormalResults() {
    const query = `
      SELECT lt.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE lt.abnormal = TRUE AND lt.status = 'completed'
      ORDER BY lt.result_received_at DESC;
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get pending lab tests (not yet collected or received)
   * @returns {Promise<Array>} Pending lab tests
   */
  static async getPending() {
    const query = `
      SELECT lt.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE lt.status IN ('ordered', 'collected')
      ORDER BY lt.ordered_at ASC;
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Search lab tests by test name or category
   * @param {string} searchQuery - Search term
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Matching lab tests
   */
  static async search(searchQuery, options = {}) {
    const { limit = 20, offset = 0 } = options;

    const query = `
      SELECT lt.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE LOWER(lt.test_name) LIKE LOWER($1) OR LOWER(lt.test_category) LIKE LOWER($2)
      ORDER BY lt.ordered_at DESC
      LIMIT $3 OFFSET $4;
    `;

    const result = await db.query(query, [`%${searchQuery}%`, `%${searchQuery}%`, limit, offset]);
    return result.rows;
  }

  /**
   * Get lab results by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Lab tests in date range
   */
  static async getByDateRange(startDate, endDate) {
    const query = `
      SELECT lt.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE lt.result_received_at >= $1 AND lt.result_received_at <= $2
      ORDER BY lt.result_received_at DESC;
    `;

    const result = await db.query(query, [startDate, endDate]);
    return result.rows;
  }

  /**
   * Update collection status
   * @param {number} id - Lab test ID
   * @returns {Promise<Object>} Updated lab test
   */
  static async markAsCollected(id) {
    const query = `
      UPDATE lab_tests
      SET status = 'collected',
          collected_at = NOW()
      WHERE id = $1 AND status = 'ordered'
      RETURNING *;
    `;

    const result = await db.query(query, [id]);

    if (!result.rows[0]) {
      throw new Error('Lab test not found or already collected');
    }

    return result.rows[0];
  }

  /**
   * Cancel lab test
   * @param {number} id - Lab test ID
   * @returns {Promise<Object>} Cancelled lab test
   */
  static async cancel(id) {
    const query = `
      UPDATE lab_tests
      SET status = 'cancelled'
      WHERE id = $1 AND status IN ('ordered', 'collected')
      RETURNING *;
    `;

    const result = await db.query(query, [id]);

    if (!result.rows[0]) {
      throw new Error('Lab test not found or cannot be cancelled');
    }

    return result.rows[0];
  }

  /**
   * Get test categories (reference data)
   * @returns {Promise<Array>} Unique test categories
   */
  static async getCategories() {
    const query = `
      SELECT DISTINCT test_category
      FROM lab_tests
      WHERE test_category IS NOT NULL
      ORDER BY test_category;
    `;

    const result = await db.query(query);
    return result.rows.map(row => row.test_category);
  }

  /**
   * Get common lab tests (reference data)
   * @returns {Promise<Array>} Common lab tests
   */
  static async getCommonTests() {
    // Placeholder for common lab tests
    const commonTests = [
      { name: 'Complete Blood Count (CBC)', category: 'Hematology', code: 'CBC' },
      { name: 'Basic Metabolic Panel (BMP)', category: 'Chemistry', code: 'BMP' },
      { name: 'Comprehensive Metabolic Panel (CMP)', category: 'Chemistry', code: 'CMP' },
      { name: 'Lipid Panel', category: 'Chemistry', code: 'LIPID' },
      { name: 'Liver Function Tests', category: 'Chemistry', code: 'LFT' },
      { name: 'Thyroid Panel (TSH)', category: 'Endocrinology', code: 'TSH' },
      { name: 'Urinalysis', category: 'Urinalysis', code: 'UA' },
      { name: 'Blood Glucose', category: 'Chemistry', code: 'GLUCOSE' },
      { name: 'HbA1c', category: 'Chemistry', code: 'HBA1C' },
      { name: 'Blood Pressure', category: 'Vital Signs', code: 'BP' },
    ];

    return commonTests;
  }
}

module.exports = LabTest;
