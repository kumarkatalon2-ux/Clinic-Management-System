/**
 * Prescription Routes
 * Handles all prescription-related API endpoints
 */

const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { verifyToken, checkRole } = require('../middleware/auth');

/**
 * POST /api/prescriptions
 * Create a new prescription
 * Role: Doctor, Administrator
 */
router.post('/', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const {
      consultation_id,
      patient_id,
      medication_name,
      dosage,
      frequency,
      duration,
      quantity,
      refills_allowed,
      expires_at,
    } = req.body;

    // Validate required fields
    if (!patient_id || !medication_name || !dosage) {
      return res.status(400).json({
        error: 'Missing required fields: patient_id, medication_name, dosage',
      });
    }

    // Check for drug interactions (if multiple medications in one request)
    // Placeholder for future drug interaction checking

    // Create prescription
    const prescription = await Prescription.create({
      consultation_id,
      patient_id,
      medication_name,
      dosage,
      frequency,
      duration,
      quantity,
      refills_allowed,
      expires_at,
    });

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription,
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/prescriptions
 * Get all prescriptions (with pagination and filters)
 * Role: Administrator, Doctor
 */
router.get('/', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    const prescriptions = await Prescription.getAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
    });

    res.status(200).json({
      message: 'Prescriptions retrieved successfully',
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error('Error retrieving prescriptions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/prescriptions/search/:medication
 * Search prescriptions by medication name
 * Role: Administrator, Doctor
 */
router.get('/search/:medication', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { medication } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const prescriptions = await Prescription.searchByMedication(medication, {
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      message: 'Prescriptions found',
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error('Error searching prescriptions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/prescriptions/expired
 * Get expired prescriptions
 * Role: Administrator, Doctor
 */
router.get('/expired', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const expiredPrescriptions = await Prescription.getExpired();

    res.status(200).json({
      message: 'Expired prescriptions retrieved',
      count: expiredPrescriptions.length,
      prescriptions: expiredPrescriptions,
    });
  } catch (error) {
    console.error('Error retrieving expired prescriptions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/prescriptions/:id
 * Get prescription by ID
 * Role: All authenticated users (with access control)
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        error: 'Prescription not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    const isOwner = req.user.id === prescription.patient_id;

    if (!isOwner && userRole !== 'administrator' && userRole !== 'doctor') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    res.status(200).json({
      message: 'Prescription retrieved successfully',
      prescription,
    });
  } catch (error) {
    console.error('Error retrieving prescription:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/prescriptions/patient/:patientId
 * Get all prescriptions for a patient
 * Role: Patient (own), Doctor, Administrator
 */
router.get('/patient/:patientId', verifyToken, async (req, res) => {
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

    const prescriptions = await Prescription.getPatientPrescriptions(
      parseInt(patientId),
      { status, limit: parseInt(limit), offset: parseInt(offset) }
    );

    res.status(200).json({
      message: 'Patient prescriptions retrieved successfully',
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error('Error retrieving patient prescriptions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * PUT /api/prescriptions/:id
 * Update prescription
 * Role: Doctor, Administrator
 */
router.put('/:id', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if prescription exists
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        error: 'Prescription not found',
      });
    }

    // Update prescription
    const updatedPrescription = await Prescription.update(id, updates);

    res.status(200).json({
      message: 'Prescription updated successfully',
      prescription: updatedPrescription,
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * POST /api/prescriptions/:id/refill
 * Request refill for prescription
 * Role: Patient (own), Doctor, Administrator
 */
router.post('/:id/refill', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if prescription exists
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        error: 'Prescription not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    if (
      req.user.id !== prescription.patient_id &&
      userRole !== 'administrator' &&
      userRole !== 'doctor'
    ) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    // Request refill
    const refillPrescription = await Prescription.requestRefill(id);

    res.status(200).json({
      message: 'Refill requested successfully',
      prescription: refillPrescription,
      refills_remaining: refillPrescription.refills_allowed,
    });
  } catch (error) {
    console.error('Error requesting refill:', error);
    res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * DELETE /api/prescriptions/:id
 * Cancel prescription
 * Role: Doctor (own), Administrator
 */
router.delete('/:id', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if prescription exists
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        error: 'Prescription not found',
      });
    }

    // Cancel prescription
    const cancelledPrescription = await Prescription.cancel(id, reason);

    res.status(200).json({
      message: 'Prescription cancelled successfully',
      prescription: cancelledPrescription,
    });
  } catch (error) {
    console.error('Error cancelling prescription:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * POST /api/prescriptions/:id/check-interactions
 * Check for drug interactions
 * Role: Doctor, Administrator
 */
router.post('/:id/check-interactions', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { medicationNames } = req.body;

    if (!medicationNames || !Array.isArray(medicationNames)) {
      return res.status(400).json({
        error: 'medicationNames must be an array',
      });
    }

    // Check interactions
    const interactions = await Prescription.checkDrugInteractions(medicationNames);

    res.status(200).json({
      message: 'Drug interactions checked',
      medications: medicationNames,
      interactions: interactions.length > 0 ? interactions : 'No interactions found',
    });
  } catch (error) {
    console.error('Error checking interactions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/prescriptions/:medication/substitutes
 * Get medication substitutes/alternatives
 * Role: Doctor, Administrator
 */
router.get('/:medication/substitutes', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { medication } = req.params;

    // Get substitutes
    const substitutes = await Prescription.getMedicationSubstitutes(medication);

    res.status(200).json({
      message: 'Medication alternatives retrieved',
      medication,
      substitutes: substitutes.length > 0 ? substitutes : 'No alternatives available',
    });
  } catch (error) {
    console.error('Error retrieving substitutes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

module.exports = router;
