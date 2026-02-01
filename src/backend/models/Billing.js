/**
 * Billing Model
 * Handles database operations for billing and invoice management
 * Manages invoices and payments
 */

const db = require('../database/connection');

class Billing {
  /**
   * Create an invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} Created invoice
   */
  static async createInvoice(invoiceData) {
    const {
      patient_id,
      appointment_id = null,
      invoice_number,
      total_amount,
      tax_amount = 0,
      discount_amount = 0,
      net_amount,
      status = 'pending',
      due_date = null,
      notes = null,
    } = invoiceData;

    const query = `
      INSERT INTO invoices (
        patient_id, appointment_id, invoice_number, total_amount, tax_amount,
        discount_amount, net_amount, status, due_date, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    try {
      const result = await db.query(query, [
        patient_id,
        appointment_id,
        invoice_number,
        total_amount,
        tax_amount,
        discount_amount,
        net_amount,
        status,
        due_date,
        notes,
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Find invoice by ID
   * @param {number} id - Invoice ID
   * @returns {Promise<Object|null>} Invoice or null
   */
  static async findInvoiceById(id) {
    const query = `
      SELECT inv.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM invoices inv
      JOIN patients p ON inv.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE inv.id = $1;
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all invoices for a patient
   * @param {number} patientId - Patient ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Patient invoices
   */
  static async getPatientInvoices(patientId, options = {}) {
    const { status = null, limit = 20, offset = 0 } = options;

    let query = `
      SELECT inv.*
      FROM invoices inv
      WHERE inv.patient_id = $1
    `;

    const params = [patientId];

    if (status) {
      query += ` AND inv.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY inv.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    try {
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching patient invoices:', error);
      return [];
    }
  }

  /**
   * Get all invoices
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} All invoices
   */
  static async getAllInvoices(options = {}) {
    const { status = null, limit = 50, offset = 0 } = options;

    let query = `
      SELECT inv.*, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email
      FROM invoices inv
      JOIN patients p ON inv.patient_id = p.id
      JOIN users u ON p.user_id = u.id
    `;

    const params = [];

    if (status) {
      query += ` WHERE inv.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY inv.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    try {
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  /**
   * Get outstanding balance for patient
   * @param {number} patientId - Patient ID
   * @returns {Promise<number>} Total outstanding balance
   */
  static async getPatientBalance(patientId) {
    const query = `
      SELECT SUM(inv.net_amount - COALESCE(paid.amount, 0)) as outstanding_balance
      FROM invoices inv
      LEFT JOIN (
        SELECT invoice_id, SUM(amount) as amount
        FROM payments
        WHERE status = 'completed'
        GROUP BY invoice_id
      ) paid ON inv.id = paid.invoice_id
      WHERE inv.patient_id = $1 AND inv.status IN ('pending', 'overdue');
    `;

    try {
      const result = await db.query(query, [patientId]);
      return parseFloat(result.rows[0]?.outstanding_balance || 0);
    } catch (error) {
      console.error('Error fetching patient balance:', error);
      return 0;
    }
  }

  /**
   * Update invoice status
   * @param {number} id - Invoice ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated invoice
   */
  static async updateInvoiceStatus(id, status) {
    const allowedStatuses = ['pending', 'sent', 'paid', 'overdue', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const query = `
      UPDATE invoices
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    try {
      const result = await db.query(query, [status, id]);

      if (!result.rows[0]) {
        throw new Error('Invoice not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  /**
   * Record payment for invoice
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment record
   */
  static async recordPayment(paymentData) {
    const {
      invoice_id,
      amount,
      payment_method = 'credit_card',
      transaction_id = null,
      notes = null,
    } = paymentData;

    // Start transaction
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Insert payment record
      const paymentQuery = `
        INSERT INTO payments (invoice_id, amount, payment_method, transaction_id, notes, status)
        VALUES ($1, $2, $3, $4, $5, 'completed')
        RETURNING *;
      `;

      const paymentResult = await client.query(paymentQuery, [
        invoice_id,
        amount,
        payment_method,
        transaction_id,
        notes,
      ]);

      // Check if invoice is fully paid
      const invoiceQuery = `
        SELECT inv.id, inv.net_amount,
               COALESCE(SUM(p.amount), 0) as paid_amount
        FROM invoices inv
        LEFT JOIN payments p ON inv.id = p.invoice_id AND p.status = 'completed'
        WHERE inv.id = $1
        GROUP BY inv.id, inv.net_amount;
      `;

      const invoiceResult = await client.query(invoiceQuery, [invoice_id]);

      if (invoiceResult.rows[0]) {
        const invoice = invoiceResult.rows[0];
        const totalPaid = Number(invoice.paid_amount) + Number(amount);

        // Update invoice status if fully paid
        if (totalPaid >= invoice.net_amount) {
          await client.query(
            'UPDATE invoices SET status = $1, updated_at = NOW() WHERE id = $2',
            ['paid', invoice_id]
          );
        }
      }

      await client.query('COMMIT');
      return paymentResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error recording payment:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get payments for invoice
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<Array>} Payment records
   */
  static async getInvoicePayments(invoiceId) {
    const query = `
      SELECT * FROM payments
      WHERE invoice_id = $1
      ORDER BY created_at DESC;
    `;

    try {
      const result = await db.query(query, [invoiceId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching invoice payments:', error);
      return [];
    }
  }

  /**
   * Get billing summary for patient
   * @param {number} patientId - Patient ID
   * @returns {Promise<Object>} Billing summary
   */
  static async getPatientBillingSummary(patientId) {
    const query = `
      SELECT
        COUNT(DISTINCT inv.id) as total_invoices,
        SUM(CASE WHEN inv.status = 'paid' THEN inv.net_amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN inv.status IN ('pending', 'overdue') THEN inv.net_amount ELSE 0 END) as outstanding_balance,
        COUNT(DISTINCT CASE WHEN inv.status = 'overdue' THEN inv.id END) as overdue_invoices
      FROM invoices inv
      WHERE inv.patient_id = $1;
    `;

    try {
      const result = await db.query(query, [patientId]);

      return {
        patient_id: patientId,
        total_invoices: result.rows[0]?.total_invoices || 0,
        total_paid: parseFloat(result.rows[0]?.total_paid || 0),
        outstanding_balance: parseFloat(result.rows[0]?.outstanding_balance || 0),
        overdue_invoices: result.rows[0]?.overdue_invoices || 0,
      };
    } catch (error) {
      console.error('Error fetching billing summary:', error);
      return {
        patient_id: patientId,
        total_invoices: 0,
        total_paid: 0,
        outstanding_balance: 0,
        overdue_invoices: 0,
      };
    }
  }

  /**
   * Get revenue summary
   * @param {string} period - 'daily', 'monthly', 'yearly'
   * @returns {Promise<Array>} Revenue data
   */
  static async getRevenueSummary(period = 'monthly') {
    let dateFormat;
    if (period === 'daily') dateFormat = 'YYYY-MM-DD';
    else if (period === 'monthly') dateFormat = 'YYYY-MM';
    else if (period === 'yearly') dateFormat = 'YYYY';
    else dateFormat = 'YYYY-MM';

    const query = `
      SELECT
        to_char(inv.created_at, $1) as period,
        COUNT(inv.id) as invoice_count,
        SUM(inv.total_amount) as total_amount,
        SUM(CASE WHEN inv.status = 'paid' THEN inv.net_amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN inv.status IN ('pending', 'overdue') THEN inv.net_amount ELSE 0 END) as outstanding_amount
      FROM invoices inv
      GROUP BY period
      ORDER BY period DESC;
    `;

    try {
      const result = await db.query(query, [dateFormat]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching revenue summary:', error);
      return [];
    }
  }
}

module.exports = Billing;
