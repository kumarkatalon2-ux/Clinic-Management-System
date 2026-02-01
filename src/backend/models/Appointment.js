/**
 * Appointment Model
 * Handles database operations for appointment scheduling
 */

const db = require('../database/connection');

class Appointment {
  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Created appointment
   */
  static async create(appointmentData) {
    const {
      patient_id,
      provider_id,
      type,
      status = 'scheduled',
      start_time,
      end_time,
      location = null,
      notes = null,
    } = appointmentData;

    // Check for conflicts
    const conflict = await this.checkConflict(provider_id, start_time, end_time);
    if (conflict) {
      throw new Error('Time slot is already booked');
    }

    const query = `
      INSERT INTO appointments (
        patient_id, provider_id, type, status, start_time, end_time, location, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const result = await db.query(query, [
      patient_id,
      provider_id,
      type,
      status,
      start_time,
      end_time,
      location,
      notes,
    ]);

    return result.rows[0];
  }

  /**
   * Check for appointment conflicts
   * @param {number} providerId - Provider ID
   * @param {string} startTime - Start time
   * @param {string} endTime - End time
   * @returns {Promise<boolean>} Has conflict
   */
  static async checkConflict(providerId, startTime, endTime) {
    const query = `
      SELECT COUNT(*) as conflict_count
      FROM appointments
      WHERE provider_id = $1
        AND status != 'cancelled'
        AND (
          (start_time < $3 AND end_time > $2)
          OR (start_time = $2)
        );
    `;

    const result = await db.query(query, [providerId, startTime, endTime]);
    return result.rows[0].conflict_count > 0;
  }

  /**
   * Find appointment by ID
   * @param {number} id - Appointment ID
   * @returns {Promise<Object|null>} Appointment or null
   */
  static async findById(id) {
    const query = `
      SELECT a.*, p.mrn, u1.email as patient_email, u1.first_name as patient_first_name,
             u1.last_name as patient_last_name, u2.email as provider_email,
             u2.first_name as provider_first_name, u2.last_name as provider_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      JOIN users u2 ON a.provider_id = u2.id
      WHERE a.id = $1;
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get appointments for patient
   * @param {number} patientId - Patient ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Patient appointments
   */
  static async getPatientAppointments(patientId, options = {}) {
    const { status = null, limit = 10, offset = 0 } = options;

    let query = `
      SELECT a.*, u.email as provider_email, u.first_name as provider_first_name,
             u.last_name as provider_last_name
      FROM appointments a
      JOIN users u ON a.provider_id = u.id
      WHERE a.patient_id = $1
    `;

    const params = [patientId];

    if (status) {
      query += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY a.start_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get appointments for provider
   * @param {number} providerId - Provider ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Provider appointments
   */
  static async getProviderAppointments(providerId, options = {}) {
    const { status = null, startDate = null, endDate = null, limit = 10, offset = 0 } = options;

    let query = `
      SELECT a.*, p.mrn, u.email as patient_email, u.first_name as patient_first_name,
             u.last_name as patient_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.provider_id = $1
    `;

    const params = [providerId];

    if (status) {
      query += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    if (startDate) {
      query += ` AND a.start_time >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND a.end_time <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ` ORDER BY a.start_time ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Update appointment
   * @param {number} id - Appointment ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated appointment
   */
  static async update(id, updates) {
    const allowedFields = ['status', 'start_time', 'end_time', 'location', 'notes'];
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
      UPDATE appointments
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Cancel appointment
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} Cancelled appointment
   */
  static async cancel(id) {
    const query = `
      UPDATE appointments
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1 AND status != 'completed'
      RETURNING *;
    `;

    const result = await db.query(query, [id]);
    if (!result.rows[0]) {
      throw new Error('Appointment not found or cannot be cancelled');
    }

    return result.rows[0];
  }

  /**
   * Get all appointments with optional filters
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} All appointments
   */
  static async getAll(options = {}) {
    const { limit = 50, offset = 0, status = null } = options;

    let query = `
      SELECT a.*, p.mrn, u1.email as patient_email,
             u2.email as provider_email
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      JOIN users u2 ON a.provider_id = u2.id
    `;

    const params = [];

    if (status) {
      query += ` WHERE a.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY a.start_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get appointments by status
   * @param {string} status - Appointment status
   * @param {number} limit - Limit results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Object>} Appointments and count
   */
  static async getByStatus(status, limit = 10, offset = 0) {
    const query = `
      SELECT a.*, p.mrn, u1.email as patient_email,
             u2.email as provider_email
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      JOIN users u2 ON a.provider_id = u2.id
      WHERE a.status = $1
      ORDER BY a.start_time DESC
      LIMIT $2 OFFSET $3;
    `;

    const countQuery = `SELECT COUNT(*) as total FROM appointments WHERE status = $1;`;

    const [appointments, countResult] = await Promise.all([
      db.query(query, [status, limit, offset]),
      db.query(countQuery, [status]),
    ]);

    return {
      appointments: appointments.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    };
  }
}

module.exports = Appointment;
