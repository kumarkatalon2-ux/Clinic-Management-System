/**
 * Lab Test Routes
 * Handles all lab test-related API endpoints
 */

const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');
const { verifyToken, checkRole } = require('../middleware/auth');

/**
 * POST /api/labs
 * Order a new lab test
 * Role: Doctor, Administrator
 */
router.post('/', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const {
      patient_id,
      provider_id,
      test_name,
      test_category,
      notes,
    } = req.body;

    // Validate required fields
    if (!patient_id || !test_name) {
      return res.status(400).json({
        error: 'Missing required fields: patient_id, test_name',
      });
    }

    // Create lab test order
    const labTest = await LabTest.create({
      patient_id,
      provider_id,
      test_name,
      test_category,
      notes,
    });

    res.status(201).json({
      message: 'Lab test ordered successfully',
      lab_test: labTest,
    });
  } catch (error) {
    console.error('Error ordering lab test:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/labs
 * Get all lab tests (with pagination and filters)
 * Role: Administrator, Doctor
 */
router.get('/', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    const labTests = await LabTest.getAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
    });

    res.status(200).json({
      message: 'Lab tests retrieved successfully',
      count: labTests.length,
      lab_tests: labTests,
    });
  } catch (error) {
    console.error('Error retrieving lab tests:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/labs/search/:query
 * Search lab tests by name or category
 * Role: Administrator, Doctor
 */
router.get('/search/:query', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const results = await LabTest.search(query, {
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      message: 'Lab tests found',
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Error searching lab tests:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/labs/pending
 * Get pending lab tests (not yet completed)
 * Role: Administrator, Doctor
 */
router.get('/pending', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const pending = await LabTest.getPending();

    res.status(200).json({
      message: 'Pending lab tests retrieved',
      count: pending.length,
      pending_tests: pending,
    });
  } catch (error) {
    console.error('Error retrieving pending tests:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/labs/abnormal
 * Get abnormal lab results
 * Role: Administrator, Doctor
 */
router.get('/abnormal', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const abnormal = await LabTest.getAbnormalResults();

    res.status(200).json({
      message: 'Abnormal lab results retrieved',
      count: abnormal.length,
      abnormal_results: abnormal,
    });
  } catch (error) {
    console.error('Error retrieving abnormal results:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/labs/categories
 * Get available test categories
 * Role: All authenticated users
 */
router.get('/categories', verifyToken, async (req, res) => {
  try {
    const categories = await LabTest.getCategories();

    res.status(200).json({
      message: 'Test categories retrieved',
      categories,
    });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/labs/common
 * Get common lab tests (reference data)
 * Role: All authenticated users
 */
router.get('/common', verifyToken, async (req, res) => {
  try {
    const commonTests = await LabTest.getCommonTests();

    res.status(200).json({
      message: 'Common lab tests retrieved',
      count: commonTests.length,
      common_tests: commonTests,
    });
  } catch (error) {
    console.error('Error retrieving common tests:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/labs/:id
 * Get lab test by ID
 * Role: All authenticated users (with access control)
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const labTest = await LabTest.findById(id);

    if (!labTest) {
      return res.status(404).json({
        error: 'Lab test not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    const isOwner = req.user.id === labTest.patient_id;

    if (!isOwner && userRole !== 'administrator' && userRole !== 'doctor') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    res.status(200).json({
      message: 'Lab test retrieved successfully',
      lab_test: labTest,
    });
  } catch (error) {
    console.error('Error retrieving lab test:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/labs/patient/:patientId
 * Get all lab tests for a patient
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

    const tests = await LabTest.getPatientTests(parseInt(patientId), {
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      message: 'Patient lab tests retrieved successfully',
      count: tests.length,
      lab_tests: tests,
    });
  } catch (error) {
    console.error('Error retrieving patient lab tests:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * PUT /api/labs/:id
 * Update lab test
 * Role: Doctor, Administrator
 */
router.put('/:id', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if lab test exists
    const labTest = await LabTest.findById(id);
    if (!labTest) {
      return res.status(404).json({
        error: 'Lab test not found',
      });
    }

    // Update lab test
    const updatedTest = await LabTest.update(id, updates);

    res.status(200).json({
      message: 'Lab test updated successfully',
      lab_test: updatedTest,
    });
  } catch (error) {
    console.error('Error updating lab test:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * POST /api/labs/:id/collect
 * Mark lab test as collected
 * Role: Lab Technician, Doctor, Administrator
 */
router.post('/:id/collect', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lab test exists
    const labTest = await LabTest.findById(id);
    if (!labTest) {
      return res.status(404).json({
        error: 'Lab test not found',
      });
    }

    // Mark as collected
    const collectedTest = await LabTest.markAsCollected(id);

    res.status(200).json({
      message: 'Lab test marked as collected',
      lab_test: collectedTest,
    });
  } catch (error) {
    console.error('Error marking test as collected:', error);
    res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * POST /api/labs/:id/result
 * Record lab result
 * Role: Doctor, Administrator
 */
router.post('/:id/result', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      result_value,
      result_unit,
      reference_range,
      abnormal,
      notes,
    } = req.body;

    // Validate required fields
    if (!result_value) {
      return res.status(400).json({
        error: 'Missing required field: result_value',
      });
    }

    // Check if lab test exists
    const labTest = await LabTest.findById(id);
    if (!labTest) {
      return res.status(404).json({
        error: 'Lab test not found',
      });
    }

    // Record result
    const resultTest = await LabTest.recordResult(id, {
      result_value,
      result_unit,
      reference_range,
      abnormal: abnormal || false,
      notes,
    });

    res.status(200).json({
      message: 'Lab result recorded successfully',
      lab_test: resultTest,
    });
  } catch (error) {
    console.error('Error recording lab result:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/labs/:id
 * Cancel lab test
 * Role: Doctor, Administrator
 */
router.delete('/:id', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lab test exists
    const labTest = await LabTest.findById(id);
    if (!labTest) {
      return res.status(404).json({
        error: 'Lab test not found',
      });
    }

    // Cancel lab test
    const cancelledTest = await LabTest.cancel(id);

    res.status(200).json({
      message: 'Lab test cancelled successfully',
      lab_test: cancelledTest,
    });
  } catch (error) {
    console.error('Error cancelling lab test:', error);
    res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * GET /api/labs/date-range/:startDate/:endDate
 * Get lab tests by date range
 * Role: Administrator, Doctor
 */
router.get('/date-range/:startDate/:endDate', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    const results = await LabTest.getByDateRange(start, end);

    res.status(200).json({
      message: 'Lab tests retrieved by date range',
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Error retrieving tests by date range:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

module.exports = router;
