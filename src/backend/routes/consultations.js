/**
 * Consultation Routes
 * Handles all consultation-related API endpoints
 */

const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const { verifyToken, checkRole } = require('../middleware/auth');

/**
 * POST /api/consultations
 * Create a new consultation
 * Role: Doctor, Administrator
 */
router.post('/', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const {
      patient_id,
      provider_id,
      appointment_id,
      consultation_type,
      start_time,
      end_time,
      chief_complaint,
      history_of_present_illness,
      physical_examination,
    } = req.body;

    // Validate required fields
    if (!patient_id || !provider_id || !consultation_type || !start_time) {
      return res.status(400).json({
        error: 'Missing required fields: patient_id, provider_id, consultation_type, start_time',
      });
    }

    // Create consultation
    const consultation = await Consultation.create({
      patient_id,
      provider_id,
      appointment_id,
      consultation_type,
      start_time,
      end_time,
      chief_complaint,
      history_of_present_illness,
      physical_examination,
    });

    res.status(201).json({
      message: 'Consultation created successfully',
      consultation,
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/consultations
 * Get all consultations with pagination
 * Role: Administrator, Doctor
 */
router.get('/', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    const consultations = await Consultation.getAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
    });

    res.status(200).json({
      message: 'Consultations retrieved successfully',
      count: consultations.length,
      consultations,
    });
  } catch (error) {
    console.error('Error retrieving consultations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/consultations/:id
 * Get consultation by ID
 * Role: All authenticated users
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    const isOwner =
      req.user.id === consultation.patient_id ||
      req.user.id === consultation.provider_id;

    if (!isOwner && userRole !== 'administrator') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    res.status(200).json({
      message: 'Consultation retrieved successfully',
      consultation,
    });
  } catch (error) {
    console.error('Error retrieving consultation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/consultations/patient/:patientId
 * Get all consultations for a patient
 * Role: Patient (own records), Doctor, Administrator
 */
router.get('/patient/:patientId', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 10, offset = 0 } = req.query;

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

    const consultations = await Consultation.getPatientConsultations(
      parseInt(patientId),
      { status, limit: parseInt(limit), offset: parseInt(offset) }
    );

    res.status(200).json({
      message: 'Patient consultations retrieved successfully',
      count: consultations.length,
      consultations,
    });
  } catch (error) {
    console.error('Error retrieving patient consultations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/consultations/doctor/:doctorId
 * Get all consultations for a doctor
 * Role: Doctor (own records), Administrator
 */
router.get('/doctor/:doctorId', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, limit = 10, offset = 0 } = req.query;

    // Check access permissions
    const userRole = req.user.role;
    if (req.user.id !== parseInt(doctorId) && userRole !== 'administrator') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    const consultations = await Consultation.getProviderConsultations(
      parseInt(doctorId),
      { status, limit: parseInt(limit), offset: parseInt(offset) }
    );

    res.status(200).json({
      message: 'Doctor consultations retrieved successfully',
      count: consultations.length,
      consultations,
    });
  } catch (error) {
    console.error('Error retrieving doctor consultations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * PUT /api/consultations/:id
 * Update consultation
 * Role: Doctor (own consultations), Administrator
 */
router.put('/:id', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if consultation exists
    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    if (req.user.id !== consultation.doctor_id && userRole !== 'administrator') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    // Update consultation
    const updatedConsultation = await Consultation.update(id, updates);

    res.status(200).json({
      message: 'Consultation updated successfully',
      consultation: updatedConsultation,
    });
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * PUT /api/consultations/:id/complete
 * Mark consultation as completed
 * Role: Doctor (own consultations), Administrator
 */
router.put('/:id/complete', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { end_time, assessment, plan, medications, follow_up_instructions } = req.body;

    // Check if consultation exists
    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    if (req.user.id !== consultation.provider_id && userRole !== 'administrator') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    // Update consultation status to completed
    const updatedConsultation = await Consultation.update(id, {
      status: 'completed',
      end_time,
      assessment,
      plan,
      medications,
      follow_up_instructions,
    });

    res.status(200).json({
      message: 'Consultation marked as completed',
      consultation: updatedConsultation,
    });
  } catch (error) {
    console.error('Error completing consultation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/consultations/:id
 * Cancel consultation
 * Role: Doctor (own consultations), Administrator
 */
router.delete('/:id', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if consultation exists
    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    if (req.user.id !== consultation.provider_id && userRole !== 'administrator') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    // Cancel consultation
    const cancelledConsultation = await Consultation.cancel(id);

    res.status(200).json({
      message: 'Consultation cancelled successfully',
      consultation: cancelledConsultation,
    });
  } catch (error) {
    console.error('Error cancelling consultation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * POST /api/consultations/:id/generate-meeting-link
 * Generate video conference meeting link
 * Role: Doctor, Administrator
 */
router.post('/:id/generate-meeting-link', verifyToken, checkRole(['administrator', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if consultation exists
    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation not found',
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    if (req.user.id !== consultation.provider_id && userRole !== 'administrator') {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    // Generate meeting link (using Jitsi Meet or similar)
    // Format: jitsi.example.com/consultation-<id>-<random>
    const meetingLink = `https://meet.jitsi/consultation-${id}-${Date.now()}`;

    // Note: In real implementation, would update consultation with meeting link
    // For now, just returning the generated link
    res.status(200).json({
      message: 'Meeting link generated successfully',
      meeting_link: meetingLink,
      consultation_id: id,
    });
  } catch (error) {
    console.error('Error generating meeting link:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

module.exports = router;
