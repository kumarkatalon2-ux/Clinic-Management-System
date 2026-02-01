/**
 * Billing Routes
 * Handles all billing, payment, and insurance claim API endpoints
 */

const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const { verifyToken, checkRole } = require('../middleware/auth');

/**
 * POST /api/billing/invoices
 * Create a new invoice
 * Role: Administrator, Doctor
 */
router.post('/invoices', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const {
      patient_id,
      service_date,
      service_type,
      description,
      amount,
      insurance_provider,
      insurance_policy_number,
      due_date,
      notes,
    } = req.body;

    // Validate required fields
    if (!patient_id || !service_date || !service_type || !description || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: patient_id, service_date, service_type, description, amount',
      });
    }

    // Create invoice
    const invoice = await Billing.createInvoice({
      patient_id,
      service_date,
      service_type,
      description,
      amount,
      insurance_provider,
      insurance_policy_number,
      due_date,
      notes,
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/invoices
 * Get all invoices
 * Role: Administrator, Doctor
 */
router.get('/invoices', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    const invoices = await Billing.getAllInvoices({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
    });

    res.status(200).json({
      message: 'Invoices retrieved successfully',
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error('Error retrieving invoices:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/invoices/:id
 * Get invoice by ID
 * Role: All authenticated users (with access control)
 */
router.get('/invoices/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Billing.findInvoiceById(id);

    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    const isOwner = req.user.id === invoice.patient_id;

    if (!isOwner && userRole !== 'administrator' && userRole !== 'doctor') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    res.status(200).json({
      message: 'Invoice retrieved successfully',
      invoice,
    });
  } catch (error) {
    console.error('Error retrieving invoice:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/patient/:patientId/invoices
 * Get invoices for a patient
 * Role: Patient (own), Doctor, Administrator
 */
router.get('/patient/:patientId/invoices', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    // Check access permissions
    const userRole = req.user.role;
    if (
      req.user.id !== parseInt(patientId) &&
      userRole !== 'administrator' &&
      userRole !== 'doctor'
    ) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    const invoices = await Billing.getPatientInvoices(parseInt(patientId), {
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      message: 'Patient invoices retrieved successfully',
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error('Error retrieving patient invoices:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/patient/:patientId/balance
 * Get patient's outstanding balance
 * Role: Patient (own), Doctor, Administrator
 */
router.get('/patient/:patientId/balance', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check access permissions
    const userRole = req.user.role;
    if (
      req.user.id !== parseInt(patientId) &&
      userRole !== 'administrator' &&
      userRole !== 'doctor'
    ) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    const balance = await Billing.getPatientBalance(parseInt(patientId));

    res.status(200).json({
      message: 'Patient balance retrieved',
      patient_id: parseInt(patientId),
      outstanding_balance: balance,
    });
  } catch (error) {
    console.error('Error retrieving patient balance:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/patient/:patientId/summary
 * Get patient billing summary
 * Role: Patient (own), Doctor, Administrator
 */
router.get('/patient/:patientId/summary', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check access permissions
    const userRole = req.user.role;
    if (
      req.user.id !== parseInt(patientId) &&
      userRole !== 'administrator' &&
      userRole !== 'doctor'
    ) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    const summary = await Billing.getPatientBillingSummary(parseInt(patientId));

    res.status(200).json({
      message: 'Patient billing summary retrieved',
      summary,
    });
  } catch (error) {
    console.error('Error retrieving billing summary:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * PUT /api/billing/invoices/:id/status
 * Update invoice status
 * Role: Administrator
 */
router.put('/invoices/:id/status', verifyToken, checkRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Missing required field: status',
      });
    }

    // Check if invoice exists
    const invoice = await Billing.findInvoiceById(id);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found',
      });
    }

    // Update status
    const updatedInvoice = await Billing.updateInvoiceStatus(id, status);

    res.status(200).json({
      message: 'Invoice status updated successfully',
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * POST /api/billing/payments
 * Record a payment
 * Role: Administrator, Patient
 */
router.post('/payments', verifyToken, checkRole(['administrator', 'patient']), async (req, res) => {
  try {
    const {
      invoice_id,
      amount,
      payment_method,
      transaction_id,
      notes,
    } = req.body;

    // Validate required fields
    if (!invoice_id || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: invoice_id, amount',
      });
    }

    // Check if invoice exists
    const invoice = await Billing.findInvoiceById(invoice_id);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found',
      });
    }

    // Check access permissions for patient
    const userRole = req.user.role;
    if (userRole === 'patient' && req.user.id !== invoice.patient_id) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    // Record payment
    const payment = await Billing.recordPayment({
      invoice_id,
      amount,
      payment_method: payment_method || 'credit_card',
      transaction_id,
      notes,
    });

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/invoices/:id/payments
 * Get payments for invoice
 * Role: All authenticated users (with access control)
 */
router.get('/invoices/:id/payments', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if invoice exists
    const invoice = await Billing.findInvoiceById(id);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    const isOwner = req.user.id === invoice.patient_id;

    if (!isOwner && userRole !== 'administrator' && userRole !== 'doctor') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    const payments = await Billing.getInvoicePayments(id);

    res.status(200).json({
      message: 'Payments retrieved successfully',
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error('Error retrieving payments:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * POST /api/billing/claims
 * Create insurance claim
 * Role: Administrator, Doctor
 */
router.post('/claims', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const {
      invoice_id,
      patient_id,
      insurance_provider,
      policy_number,
      claim_amount,
      claim_type,
      notes,
    } = req.body;

    // Validate required fields
    if (!invoice_id || !patient_id || !insurance_provider || !policy_number || !claim_amount) {
      return res.status(400).json({
        error: 'Missing required fields: invoice_id, patient_id, insurance_provider, policy_number, claim_amount',
      });
    }

    // Create claim
    const claim = await Billing.createClaim({
      invoice_id,
      patient_id,
      insurance_provider,
      policy_number,
      claim_amount,
      claim_type,
      notes,
    });

    res.status(201).json({
      message: 'Insurance claim created successfully',
      claim,
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/claims/:id
 * Get claim by ID
 * Role: All authenticated users (with access control)
 */
router.get('/claims/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await Billing.findClaimById(id);

    if (!claim) {
      return res.status(404).json({
        error: 'Claim not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    const isOwner = req.user.id === claim.patient_id;

    if (!isOwner && userRole !== 'administrator' && userRole !== 'doctor') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    res.status(200).json({
      message: 'Claim retrieved successfully',
      claim,
    });
  } catch (error) {
    console.error('Error retrieving claim:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/patient/:patientId/claims
 * Get claims for patient
 * Role: Patient (own), Doctor, Administrator
 */
router.get('/patient/:patientId/claims', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    // Check access permissions
    const userRole = req.user.role;
    if (
      req.user.id !== parseInt(patientId) &&
      userRole !== 'administrator' &&
      userRole !== 'doctor'
    ) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    const claims = await Billing.getPatientClaims(parseInt(patientId), {
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      message: 'Patient claims retrieved successfully',
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error('Error retrieving patient claims:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * PUT /api/billing/claims/:id/status
 * Update claim status
 * Role: Administrator
 */
router.put('/claims/:id/status', verifyToken, checkRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approval_amount, denial_reason } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Missing required field: status',
      });
    }

    // Check if claim exists
    const claim = await Billing.findClaimById(id);
    if (!claim) {
      return res.status(404).json({
        error: 'Claim not found',
      });
    }

    // Update claim
    const updatedClaim = await Billing.updateClaim(id, status, {
      approval_amount,
      denial_reason,
    });

    res.status(200).json({
      message: 'Claim status updated successfully',
      claim: updatedClaim,
    });
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * POST /api/billing/verify-eligibility
 * Verify insurance eligibility
 * Role: Doctor, Administrator
 */
router.post('/verify-eligibility', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { insurance_provider, policy_number } = req.body;

    if (!insurance_provider || !policy_number) {
      return res.status(400).json({
        error: 'Missing required fields: insurance_provider, policy_number',
      });
    }

    // Verify eligibility
    const eligibility = await Billing.verifyEligibility(insurance_provider, policy_number);

    res.status(200).json({
      message: 'Insurance eligibility verified',
      eligibility,
    });
  } catch (error) {
    console.error('Error verifying eligibility:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/revenue
 * Get revenue summary
 * Role: Administrator
 */
router.get('/revenue', verifyToken, checkRole(['administrator']), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    const revenue = await Billing.getRevenueSummary(period);

    res.status(200).json({
      message: 'Revenue summary retrieved',
      period,
      revenue,
    });
  } catch (error) {
    console.error('Error retrieving revenue:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/claims-statistics
 * Get insurance claims statistics
 * Role: Administrator
 */
router.get('/claims-statistics', verifyToken, checkRole(['administrator']), async (req, res) => {
  try {
    const stats = await Billing.getClaimStatistics();

    res.status(200).json({
      message: 'Claims statistics retrieved',
      statistics: stats,
    });
  } catch (error) {
    console.error('Error retrieving claims statistics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

module.exports = router;
