/**
 * Appointment Routes
 * Appointment scheduling and management
 * 
 * GET    /api/appointments - List appointments
 * GET    /api/appointments/:id - Get appointment details
 * POST   /api/appointments - Schedule new appointment
 * PUT    /api/appointments/:id - Update appointment
 * DELETE /api/appointments/:id - Cancel appointment
 * GET    /api/appointments/patient/:patientId - Get patient's appointments
 * GET    /api/appointments/provider/:providerId - Get provider's appointments
 * GET    /api/appointments/availability - Check provider availability
 */

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to verify JWT token
 */
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
    });
  }
};

/**
 * Middleware to check admin/doctor role
 */
const requireAdminOrDoctor = (req, res, next) => {
  if (req.user.role !== 'administrator' && req.user.role !== 'doctor') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only administrators and doctors can manage appointments',
    });
  }
  next();
};

// ============================================
// LIST ALL APPOINTMENTS - GET /api/appointments
// ============================================
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('📋 LISTING APPOINTMENTS');

    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Get appointments with filters
    const appointments = await Appointment.getAll({
      limit: parseInt(limit),
      offset,
      status: status || null,
    });

    console.log(`✅ Retrieved ${appointments.length} appointments`);

    res.status(200).json({
      message: 'Appointments retrieved successfully',
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: appointments.length,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error listing appointments:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// GET APPOINTMENT BY ID - GET /api/appointments/:id
// ============================================
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 FETCHING APPOINTMENT ${id}`);

    const appointment = await Appointment.findById(parseInt(id));

    if (!appointment) {
      console.log(`❌ Appointment not found: ${id}`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Appointment not found',
      });
    }

    console.log(`✅ Appointment retrieved: ${appointment.id}`);

    res.status(200).json({
      message: 'Appointment retrieved successfully',
      data: { appointment },
    });
  } catch (error) {
    console.error('❌ Error fetching appointment:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// SCHEDULE APPOINTMENT - POST /api/appointments
// ============================================
router.post('/', requireAuth, requireAdminOrDoctor, async (req, res) => {
  try {
    console.log('📅 SCHEDULING NEW APPOINTMENT');

    const {
      patient_id,
      provider_id,
      type,
      start_time,
      end_time,
      location,
      notes,
    } = req.body;

    // Validate required fields
    if (!patient_id || !provider_id || !type || !start_time || !end_time) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'patient_id, provider_id, type, start_time, and end_time are required',
      });
    }

    // Validate appointment type
    const validTypes = ['consultation', 'checkup', 'follow-up', 'procedure', 'lab', 'other'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `type must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Validate times
    const start = new Date(start_time);
    const end = new Date(end_time);

    if (start >= end) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'start_time must be before end_time',
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Appointment cannot be in the past',
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient_id,
      provider_id,
      type: type.toLowerCase(),
      start_time,
      end_time,
      location: location || null,
      notes: notes || null,
    });

    console.log(`✅ Appointment created: ${appointment.id}`);

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      data: { appointment },
    });
  } catch (error) {
    console.error('❌ Error scheduling appointment:', error);

    if (error.message.includes('Time slot is already booked')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Time slot is already booked for this provider',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// UPDATE APPOINTMENT - PUT /api/appointments/:id
// ============================================
router.put('/:id', requireAuth, requireAdminOrDoctor, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️  UPDATING APPOINTMENT ${id}`);

    // Check if appointment exists
    const existingAppointment = await Appointment.findById(parseInt(id));
    if (!existingAppointment) {
      console.log(`❌ Appointment not found: ${id}`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Appointment not found',
      });
    }

    // Validate status if provided
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
    if (req.body.status && !validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Update appointment
    const updatedAppointment = await Appointment.update(parseInt(id), req.body);

    console.log(`✅ Appointment updated: ${id}`);

    res.status(200).json({
      message: 'Appointment updated successfully',
      data: { appointment: updatedAppointment },
    });
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// CANCEL APPOINTMENT - DELETE /api/appointments/:id
// ============================================
router.delete('/:id', requireAuth, requireAdminOrDoctor, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`❌ CANCELLING APPOINTMENT ${id}`);

    // Check if appointment exists
    const existingAppointment = await Appointment.findById(parseInt(id));
    if (!existingAppointment) {
      console.log(`❌ Appointment not found: ${id}`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Appointment not found',
      });
    }

    // Cancel appointment (soft delete - set status to cancelled)
    const cancelledAppointment = await Appointment.update(parseInt(id), {
      status: 'cancelled',
    });

    console.log(`✅ Appointment cancelled: ${id}`);

    res.status(200).json({
      message: 'Appointment cancelled successfully',
      data: {
        id: parseInt(id),
        status: 'cancelled',
      },
    });
  } catch (error) {
    console.error('❌ Error cancelling appointment:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// GET PATIENT'S APPOINTMENTS - GET /api/appointments/patient/:patientId
// ============================================
router.get('/patient/:patientId', requireAuth, async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log(`👤 FETCHING APPOINTMENTS FOR PATIENT ${patientId}`);

    const appointments = await Appointment.getByPatient(parseInt(patientId));

    console.log(`✅ Retrieved ${appointments.length} appointments for patient`);

    res.status(200).json({
      message: 'Patient appointments retrieved successfully',
      data: { appointments },
    });
  } catch (error) {
    console.error('❌ Error fetching patient appointments:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// GET PROVIDER'S APPOINTMENTS - GET /api/appointments/provider/:providerId
// ============================================
router.get('/provider/:providerId', requireAuth, async (req, res) => {
  try {
    const { providerId } = req.params;
    console.log(`👨‍⚕️  FETCHING APPOINTMENTS FOR PROVIDER ${providerId}`);

    const appointments = await Appointment.getByProvider(parseInt(providerId));

    console.log(`✅ Retrieved ${appointments.length} appointments for provider`);

    res.status(200).json({
      message: 'Provider appointments retrieved successfully',
      data: { appointments },
    });
  } catch (error) {
    console.error('❌ Error fetching provider appointments:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// CHECK PROVIDER AVAILABILITY - GET /api/appointments/availability
// ============================================
router.get('/availability/check', requireAuth, async (req, res) => {
  try {
    const { provider_id, start_time, end_time } = req.query;

    console.log('🔍 CHECKING PROVIDER AVAILABILITY');

    if (!provider_id || !start_time || !end_time) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'provider_id, start_time, and end_time are required',
      });
    }

    const hasConflict = await Appointment.checkConflict(
      parseInt(provider_id),
      start_time,
      end_time
    );

    console.log(`✅ Availability check: ${hasConflict ? 'BOOKED' : 'AVAILABLE'}`);

    res.status(200).json({
      message: 'Availability check completed',
      data: {
        providerId: parseInt(provider_id),
        startTime: start_time,
        endTime: end_time,
        available: !hasConflict,
      },
    });
  } catch (error) {
    console.error('❌ Error checking availability:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

module.exports = router;
