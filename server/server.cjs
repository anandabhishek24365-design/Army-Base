const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory sessions and logs
let sessions = {};
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
    if (err) console.error("Failed to write to audit log file:", err);
  });
}

// Ensure audit.log exists
if (!fs.existsSync(LOG_FILE_PATH)) {
  fs.writeFileSync(LOG_FILE_PATH, "--- INDIAN ARMY PORTAL SECURE AUDIT LOG INITIALIZED ---\n");
}

// 1. Auth Endpoint: Standard login credentials validation
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Standard Admin credentials
  if (username === "Abhishek2006" && password === "Abhishek@2006") {
    // Generate secure 6-digit OTP code (simulated)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessions[username] = { otp, otpExpiry: Date.now() + 5 * 60 * 1000, verified: false };
    
    // Log OTP generation (Military Security Practice)
    appendAuditLog(username, "OTP Generated", "OTP verification code dispatched to administrative terminal.");
    
    // Return OTP to client so it can be shown in a visual mock toast/toast log (as discussed in plan)
    return res.status(200).json({ success: true, message: "Credentials accepted. Verification code generated.", otp });
  } else {
    appendAuditLog("GUEST / INCORRECT CREDENTIALS", "Failed Login Attempt", `Failed login with username: ${username}`);
    return res.status(401).json({ success: false, message: "Invalid credentials. Access Denied." });
  }
});

// 2. OTP Verification Endpoint
app.post('/api/auth/verify-otp', (req, res) => {
  const { username, otp } = req.body;
  const session = sessions[username];
  
  if (!session) {
    return res.status(400).json({ success: false, message: "Session expired or invalid. Restart login." });
  }
  
  if (Date.now() > session.otpExpiry) {
    appendAuditLog(username, "OTP Expired", "Authentication failed due to expired verification token.");
    return res.status(400).json({ success: false, message: "OTP expired. Please try again." });
  }
  
  if (session.otp === otp) {
    session.verified = true;
    const token = "IA-JWT-" + Math.random().toString(36).substring(2, 15);
    session.token = token;
    
    appendAuditLog(username, "User Authenticated", "Two-factor OTP verified successfully. Secure terminal access granted.");
    return res.status(200).json({ success: true, token, username });
  } else {
    appendAuditLog(username, "Failed OTP Verification", "Incorrect OTP code entered.");
    return res.status(401).json({ success: false, message: "Invalid OTP code. Authentication Failed." });
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
  
  const record = mockDatabase[armyNumber];
  if (record) {
    appendAuditLog("System Admin (HQ)", "Record Searched", `Army No: ${armyNumber} - ${record.personalInfo.fullName} (Access Granted)`);
    return res.status(200).json({ success: true, record });
  } else {
    appendAuditLog("System Admin (HQ)", "Record Search Failed", `Army No: ${armyNumber} searched but not found.`);
    return res.status(404).json({ success: false, message: "Personnel record not found." });
  }
});

// 4. Secure logging API to allow client to trigger custom audit entries
app.post('/api/audit/log', (req, res) => {
  const { operator, action, details } = req.body;
  appendAuditLog(operator, action, details);
  return res.status(200).json({ success: true });
});

// 5. Get Audit Logs
app.get('/api/audit/logs', (req, res) => {
  return res.status(200).json({ success: true, logs: mockAuditLogs });
});

// 6. Get Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
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
        console.error("Failed to write batch to db.json:", err);
        return res.status(500).json({ success: false, message: "Failed to persist batch records." });
      }
      
      appendAuditLog("System Admin (HQ)", "Personnel Commissioned (Batch)", `Commissioned ${payload.length} cadets: ${addedArmyNumbers.join(', ')}`);
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
        console.error("Failed to write new cadet to db.json file:", err);
        return res.status(500).json({ success: false, message: "Failed to persist record to disk." });
      }
      
      appendAuditLog("System Admin (HQ)", "Personnel Commissioned", `Commissioned Cadet: ${newRecord.personalInfo.fullName} (Army No: ${armyNumber})`);
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
