/**
 * User Model
 * Manages user account data, authentication, and profile information
 */

const pool = require('../database/pool');
const connection = require('../database/connection');
const bcrypt = require('bcrypt');
const fallback = require('../database/fallback-users');

class User {
  /**
   * Create a new user
   * @param {Object} userData - User data { email, password, firstName, lastName, role }
   * @returns {Promise<Object>} Created user object
   */
  static async create(userData) {
    const { email, password, firstName, lastName, role = 'patient' } = userData;

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Try database first, fall back to in-memory if unavailable
    try {
      const query = `
        INSERT INTO users (email, password_hash, first_name, last_name, role, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, email, first_name, last_name, role, status, created_at
      `;

      const values = [email, hashedPassword, firstName || '', lastName || '', role, 'active'];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (dbError) {
      console.warn('⚠️  Database unavailable, using fallback registration');
      
      // Check if user already exists in fallback
      if (fallback.findUserByEmail(email)) {
        throw new Error('Email already exists');
      }

      // Create in-memory user
      const newUser = {
        id: Math.max(0, ...fallback.fallbackDatabase.users.map(u => u.id)) + 1,
        email,
        password_hash: hashedPassword,
        first_name: firstName || '',
        last_name: lastName || '',
        role: role || 'patient',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      fallback.fallbackDatabase.users.push(newUser);
      return {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        status: newUser.status,
        created_at: newUser.created_at,
      };
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User object or null
   */
  static async findByEmail(email) {
    try {
      const query = `
        SELECT id, email, password_hash, first_name, last_name, role, status, created_at, updated_at
        FROM users
        WHERE email = $1
      `;

      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (dbError) {
      console.warn('⚠️  Database unavailable, using fallback lookup');
      return fallback.findUserByEmail(email) || null;
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT id, email, first_name, last_name, role, status, created_at, updated_at
        FROM users
        WHERE id = $1
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (dbError) {
      console.warn('⚠️  Database unavailable, using fallback lookup');
      const user = fallback.findUserById(id);
      if (user) {
        // Return without password hash
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    }
  }

  /**
   * Verify password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user profile
   * @param {number} id - User ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  static async update(id, updateData) {
    const { firstName, lastName, role, status } = updateData;
    const updates = [];
    const values = [id];
    let paramCount = 2;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, email, first_name, last_name, role, status, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Get all users (admin function)
   * @param {Object} options - Filter/pagination options
   * @returns {Promise<Array>} Array of users
   */
  static async getAll(options = {}) {
    const { limit = 50, offset = 0, role = null, status = 'active' } = options;
    let query = 'SELECT id, email, first_name, last_name, role, status, created_at FROM users WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount++}`;
      values.push(role);
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      values.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Count total users
   * @returns {Promise<number>} Total user count
   */
  static async count() {
    const query = 'SELECT COUNT(*) as count FROM users WHERE status = $1';
    const result = await pool.query(query, ['active']);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = User;
