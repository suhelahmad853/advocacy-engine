const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const router = express.Router();

// Employee Registration
router.post('/register', async (req, res) => {
  try {
    const { employeeId, firstName, lastName, email, password, role, department } = req.body;
    
    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ 
      $or: [{ email }, { employeeId }] 
    });
    
    if (existingEmployee) {
      return res.status(400).json({ 
        error: 'Employee with this email or ID already exists' 
      });
    }
    
    // Create new employee
    const employee = new Employee({
      employeeId,
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      expertise: [],
      skills: []
    });
    
    await employee.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { employeeId: employee._id, email: employee.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Employee registered successfully',
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        department: employee.department
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Employee Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find employee by email
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await employee.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { employeeId: employee._id, email: employee.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        advocacyProfile: employee.advocacyProfile
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current employee profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const employee = await Employee.findById(decoded.employeeId)
      .select('-password');
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ employee });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update employee profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const { expertise, skills, contentPreferences, socialNetworks } = req.body;
    
    const employee = await Employee.findById(decoded.employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Update fields
    if (expertise) employee.expertise = expertise;
    if (skills) employee.skills = skills;
    if (contentPreferences) employee.contentPreferences = contentPreferences;
    if (socialNetworks) employee.socialNetworks = socialNetworks;
    
    await employee.save();
    
    res.json({ 
      message: 'Profile updated successfully',
      employee: {
        id: employee._id,
        expertise: employee.expertise,
        skills: employee.skills,
        contentPreferences: employee.contentPreferences,
        socialNetworks: employee.socialNetworks
      }
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

module.exports = router; 