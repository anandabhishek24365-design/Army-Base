const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// JWT Cryptographic Signatures for Stateless Serverless Sessions
const SECRET_KEY = process.env.JWT_SECRET || 'indian_army_portal_secure_secret_key_2026';

function generateStateToken(username, otp, expiresAt) {
  const data = JSON.stringify({ username, otp, expiresAt });
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + signature;
}

function verifyStateToken(token, username, otp) {
  try {
    const [dataBase64, signature] = token.split('.');
    if (!dataBase64 || !signature) return false;
    const dataStr = Buffer.from(dataBase64, 'base64').toString('utf-8');
    const data = JSON.parse(dataStr);
    
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(dataStr).digest('hex');
    if (signature !== expectedSignature) return false;
    
    if (data.username !== username || data.otp !== otp) return false;
    if (Date.now() > data.expiresAt) return false;
    
    return true;
  } catch (err) {
    return false;
  }
}

function generateUserToken(username) {
  const data = JSON.stringify({ username, role: 'admin', expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + signature;
}

function verifyUserToken(token) {
  try {
    const [dataBase64, signature] = token.split('.');
    if (!dataBase64 || !signature) return null;
    const dataStr = Buffer.from(dataBase64, 'base64').toString('utf-8');
    const data = JSON.parse(dataStr);
    
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(dataStr).digest('hex');
    if (signature !== expectedSignature) return null;
    
    if (Date.now() > data.expiresAt) return null;
    return data.username;
  } catch (err) {
    return null;
  }
}

// SMTP mailer transporter config
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || '', // Gmail email address
    pass: process.env.SMTP_PASS || ''  // Gmail App Password
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory logs
let mockAuditLogs = [
  { timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), operator: "System Admin (HQ)", action: "User session initialized", details: "Terminal ADM-09 SECURE" },
  { timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), operator: "System Admin (HQ)", action: "Record Searched", details: "Army No: JC-481920K (Access Granted)" },
  { timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), operator: "System Admin (HQ)", action: "Document Downloaded", details: "Aadhaar Card Preview - Neeraj Chopra" }
];

const LOG_FILE_PATH = path.join(__dirname, 'audit.log');

// Seed personnel data (aligned with db.json)
const mockDatabase = require('./db.json');

// Secure helper to write logs to file
function appendAuditLog(operator, action, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operator: operator || "System Admin",
    action,
    details
  };
  
  mockAuditLogs.unshift(logEntry); // Add to memory list
  
  const fileLine = `[${logEntry.timestamp}] OPERATOR: ${logEntry.operator} | ACTION: ${logEntry.action} | DETAILS: ${logEntry.details}\n`;
  
  fs.appendFile(LOG_FILE_PATH, fileLine, (err) => {
    if (err) {
      console.warn("Failed to write to audit log file (expected in read-only environment like Vercel):", err.message);
    }
  });
}

// Ensure audit.log exists (will fail gracefully in Vercel if missing, but it is tracked in git)
if (!fs.existsSync(LOG_FILE_PATH)) {
  try {
    fs.writeFileSync(LOG_FILE_PATH, "--- INDIAN ARMY PORTAL SECURE AUDIT LOG INITIALIZED ---\n");
  } catch (err) {
    console.warn("Could not create initial audit.log file due to write constraints:", err.message);
  }
}

// 1. Auth Endpoint: Standard login credentials validation
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Standard Admin credentials
  if (username === "Abhishek2006" && password === "Abhishek@2006") {
    // Generate secure 6-digit OTP code (simulated)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    // Generate stateless temporary state token
    const tempToken = generateStateToken(username, otp, expiresAt);
    
    // Log OTP generation (Military Security Practice)
    appendAuditLog(username, "OTP Generated", "OTP verification code dispatched to administrative terminal.");
    
    // Return OTP to client so it can be shown in a visual mock toast
    return res.status(200).json({ success: true, message: "Credentials accepted. Verification code generated.", otp, tempToken });
  } else {
    appendAuditLog("GUEST / INCORRECT CREDENTIALS", "Failed Login Attempt", `Failed login with username: ${username}`);
    return res.status(401).json({ success: false, message: "Invalid credentials. Access Denied." });
  }
});

// 2. OTP Verification Endpoint
app.post('/api/auth/verify-otp', (req, res) => {
  const { username, otp, tempToken } = req.body;

  if (!tempToken) {
    return res.status(400).json({ success: false, message: "Session expired or invalid. Restart login." });
  }

  const isValid = verifyStateToken(tempToken, username, otp);
  
  if (isValid) {
    const finalUsername = username.includes('@') ? username.split('@')[0] : username;
    const token = generateUserToken(finalUsername);
    
    appendAuditLog(finalUsername, "User Authenticated", "Two-factor OTP verified successfully. Secure terminal access granted.");
    return res.status(200).json({ success: true, token, username: finalUsername });
  } else {
    appendAuditLog(username || "GUEST", "Failed OTP Verification", "Incorrect or expired OTP entered.");
    return res.status(401).json({ success: false, message: "Invalid OTP code. Authentication Failed." });
  }
});

// 2b. Google Sign-In and Gmail OTP Dispatch Endpoint
app.post('/api/auth/google-login', async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required for Google authentication." });
  }

  // Domain verification: Allow only @indianarmy.nic.in or developer emails (e.g. containing 'anandabhishek24365')
  const isAuthorizedDomain = email.endsWith('@indianarmy.nic.in');
  const isDeveloperEmail = email.toLowerCase().includes('anandabhishek24365');
  
  if (!isAuthorizedDomain && !isDeveloperEmail) {
    appendAuditLog("UNAUTHORIZED SSO ATTEMPT", "Access Denied", `Google login rejected for unauthorized domain: ${email}`);
    return res.status(403).json({ 
      success: false, 
      message: "Access Denied. Only official @indianarmy.nic.in Google accounts are authorized." 
    });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const username = email.split('@')[0];

  // Generate stateless state token
  const tempToken = generateStateToken(email, otpCode, expiresAt);

  appendAuditLog(name || username, "Google Login Request", `Initiated login for email: ${email}. Dispatched Gmail OTP.`);

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const mailOptions = {
      from: `"Indian Army Personnel Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "[SECRET] Security Verification Code - Indian Army Portal",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #080a08; color: #c2b280; padding: 20px; border: 1px solid #d4af37; border-radius: 8px; max-width: 500px; margin: auto;">
          <h2 style="color: #ff6b00; border-bottom: 1px solid #d4af37; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">
            Secure Administrative Dispatch
          </h2>
          <p style="font-size: 13px; line-height: 1.5; color: #ffffff;">
            Officer: <strong>${name || username}</strong> (${email})
          </p>
          <p style="font-size: 13px; line-height: 1.5; color: #c2b280;">
            A security verification challenge has been requested for your administrative account. Please enter the following 6-digit cryptographic security code:
          </p>
          <div style="background-color: #0f180f; border: 1px solid #2d4a2d; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #d4af37;">${otpCode}</span>
          </div>
          <p style="font-size: 10px; color: #486e48; line-height: 1.4;">
            NOTICE: This code is valid for exactly 5 minutes. If you did not initiate this request, immediately alert the Central Cyber Division and change your administrative cryptographic key.
          </p>
        </div>
      `
    };

    try {
      await mailTransporter.sendMail(mailOptions);
      console.log(`[SMTP] Successfully sent OTP to ${email}`);
      return res.json({ success: true, method: "gmail", otpSent: true, otp: "DISPATCHED", tempToken });
    } catch (err) {
      console.error(`[SMTP] Failed to send email to ${email}:`, err);
      return res.json({ 
        success: true, 
        method: "sandbox", 
        otpSent: true, 
        otp: otpCode, 
        tempToken,
        message: "SMTP Mailer offline. Cryptographic code dispatched to secure terminal console." 
      });
    }
  } else {
    console.log(`\n==================================================`);
    console.log(`[SECURITY DISPATCH] Google Login OTP for ${email}: ${otpCode}`);
    console.log(`==================================================\n`);
    return res.json({ 
      success: true, 
      method: "sandbox", 
      otpSent: true, 
      otp: otpCode, 
      tempToken,
      message: "SMTP Mailer offline. Cryptographic code dispatched to secure terminal console." 
    });
  }
});

// 3. Personnel Search API (Requires simulated Auth check)
app.get('/api/personnel/:armyNumber', (req, res) => {
  const authHeader = req.headers.authorization;
  const armyNumber = req.params.armyNumber.toUpperCase();
  
  // Basic security token check
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    appendAuditLog("UNAUTHORIZED TERMINAL", "Access Violated", `Attempted to search record for Army No: ${armyNumber} without token.`);
    return res.status(403).json({ success: false, message: "Unauthorised access. Credentials missing." });
  }
  
  const token = authHeader.split(' ')[1];
  const verifiedUser = verifyUserToken(token);
  if (!verifiedUser) {
    appendAuditLog("UNAUTHORIZED TERMINAL", "Access Violated", `Attempted to search record for Army No: ${armyNumber} with invalid token.`);
    return res.status(401).json({ success: false, message: "Unauthorised access. Session token is invalid or expired." });
  }
  
  const record = mockDatabase[armyNumber];
  if (record) {
    appendAuditLog(verifiedUser, "Record Searched", `Army No: ${armyNumber} - ${record.personalInfo.fullName} (Access Granted)`);
    return res.status(200).json({ success: true, record });
  } else {
    appendAuditLog(verifiedUser, "Record Search Failed", `Army No: ${armyNumber} searched but not found.`);
    return res.status(404).json({ success: false, message: "Personnel record not found." });
  }
});

// 4. Secure logging API to allow client to trigger custom audit entries
app.post('/api/audit/log', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ success: false, message: "Unauthorised access. Credentials missing." });
  }
  
  const token = authHeader.split(' ')[1];
  const verifiedUser = verifyUserToken(token);
  if (!verifiedUser) {
    return res.status(401).json({ success: false, message: "Unauthorised access. Session token is invalid or expired." });
  }

  const { operator, action, details } = req.body;
  appendAuditLog(verifiedUser || operator, action, details);
  return res.status(200).json({ success: true });
});

// 5. Get Audit Logs
app.get('/api/audit/logs', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ success: false, message: "Unauthorised access. Credentials missing." });
  }
  
  const token = authHeader.split(' ')[1];
  const verifiedUser = verifyUserToken(token);
  if (!verifiedUser) {
    return res.status(401).json({ success: false, message: "Unauthorised access. Session token is invalid or expired." });
  }

  return res.status(200).json({ success: true, logs: mockAuditLogs });
});

// 6. Get Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ success: false, message: "Unauthorised access. Credentials missing." });
  }
  
  const token = authHeader.split(' ')[1];
  const verifiedUser = verifyUserToken(token);
  if (!verifiedUser) {
    return res.status(401).json({ success: false, message: "Unauthorised access. Session token is invalid or expired." });
  }

  // Aggregate stats from database
  const totalActive = Object.values(mockDatabase).filter(p => p.personalInfo.status === "Active").length;
  const totalPersonnel = Object.keys(mockDatabase).length;
  
  res.status(200).json({
    success: true,
    stats: {
      totalPersonnel,
      activePersonnel: totalActive,
      onDuty: totalActive - 1, // Simulated duty roster
      onLeave: 1, // Sub. Neeraj Chopra is currently on Special Training leave
      pendingLeaves: 2,
      searchCount: mockAuditLogs.filter(l => l.action === "Record Searched").length
    }
  });
});

// 7. Add Cadet / Commission Personnel (Supports Batch)
app.post('/api/personnel', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    appendAuditLog("UNAUTHORIZED TERMINAL", "Access Violated", "Attempted to commission cadet without session token.");
    return res.status(403).json({ success: false, message: "Unauthorised access. Session token required." });
  }

  const token = authHeader.split(' ')[1];
  const verifiedUser = verifyUserToken(token);
  if (!verifiedUser) {
    appendAuditLog("UNAUTHORIZED TERMINAL", "Access Violated", "Attempted to commission cadet with invalid token.");
    return res.status(401).json({ success: false, message: "Unauthorised access. Session token is invalid or expired." });
  }

  const payload = req.body;
  
  if (Array.isArray(payload)) {
    // Process Batch Array
    const addedArmyNumbers = [];
    
    for (const record of payload) {
      if (!record.personalInfo || !record.personalInfo.armyNumber || !record.personalInfo.fullName) {
        return res.status(400).json({ success: false, message: "Invalid cadet in batch. Army Number and Full Name are mandatory." });
      }
      const num = record.personalInfo.armyNumber.toUpperCase();
      record.personalInfo.armyNumber = num;
      
      if (mockDatabase[num]) {
        return res.status(400).json({ success: false, message: `Duplicate Record Error: Army Number ${num} already exists in registry.` });
      }
    }
    
    // Save all to database memory
    payload.forEach(record => {
      mockDatabase[record.personalInfo.armyNumber] = record;
      addedArmyNumbers.push(record.personalInfo.armyNumber);
    });

    const DB_FILE_PATH = path.join(__dirname, 'db.json');
    fs.writeFile(DB_FILE_PATH, JSON.stringify(mockDatabase, null, 2), (err) => {
      if (err) {
        console.warn("Failed to write batch to db.json (expected in read-only environment like Vercel):", err.message);
      }
      
      appendAuditLog(verifiedUser, "Personnel Commissioned (Batch)", `Commissioned ${payload.length} cadets: ${addedArmyNumbers.join(', ')}`);
      return res.status(200).json({ success: true, message: `Successfully commissioned batch of ${payload.length} cadets.` });
    });
    
  } else {
    // Process Single Object
    const newRecord = payload;
    if (!newRecord.personalInfo || !newRecord.personalInfo.armyNumber || !newRecord.personalInfo.fullName) {
      return res.status(400).json({ success: false, message: "Invalid cadet payload. Army Number and Full Name are mandatory." });
    }

    const armyNumber = newRecord.personalInfo.armyNumber.toUpperCase();
    newRecord.personalInfo.armyNumber = armyNumber;

    if (mockDatabase[armyNumber]) {
      return res.status(400).json({ success: false, message: `Record for Army Number ${armyNumber} already exists in database.` });
    }

    mockDatabase[armyNumber] = newRecord;

    const DB_FILE_PATH = path.join(__dirname, 'db.json');
    fs.writeFile(DB_FILE_PATH, JSON.stringify(mockDatabase, null, 2), (err) => {
      if (err) {
        console.warn("Failed to write new cadet to db.json file (expected in read-only environment like Vercel):", err.message);
      }
      
      appendAuditLog(verifiedUser, "Personnel Commissioned", `Commissioned Cadet: ${newRecord.personalInfo.fullName} (Army No: ${armyNumber})`);
      return res.status(200).json({ success: true, message: `Cadet ${armyNumber} commissioned successfully.` });
    });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Indian Army Secure Express Server running on port ${PORT}`);
  });
}

module.exports = app;
