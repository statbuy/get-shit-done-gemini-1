const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');
const initSqlJs = require('sql.js/dist/sql-asm.js');

/**
 * Persist the current database to disk and close it.
 * @param {Object} db - The sql.js database instance.
 * @param {string} dbPath - Path to save the database.
 */
function persistAndClose(db, dbPath) {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } finally {
    db.close();
  }
}

/**
 * Run a script in a subagent (child process) with database handoff.
 *
 * @param {Object} db - The current sql.js database instance (will be closed!).
 * @param {string} dbPath - Path to the database file on disk.
 * @param {string} scriptPath - Path to the script to run in child process.
 * @param {Array} args - Arguments to pass to the script.
 * @returns {Promise<Object>} Resolves with new db instance on success.
 */
async function runSubagent(db, dbPath, scriptPath, args = []) {
  // 1. Export and close parent DB
  // We assume db is open. If it's null, we just proceed (maybe first run).
  if (db) {
    persistAndClose(db, dbPath);
  }

  // 2. Prepare log file for IPC
  const logDir = path.dirname(dbPath);
  const logFile = path.join(logDir, `subagent-${Date.now()}.log`);

  // Ensure directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // 3. Spawn child process
  return new Promise((resolve, reject) => {
    // Pass dbPath and logFile as first two args to the script
    const child = fork(scriptPath, [dbPath, logFile, ...args], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    child.on('exit', async (code) => {
      // 4. Re-initialize parent DB from disk
      let newDb;
      try {
        const SQL = await initSqlJs();
        if (fs.existsSync(dbPath)) {
          const filebuffer = fs.readFileSync(dbPath);
          newDb = new SQL.Database(filebuffer);
        } else {
          newDb = new SQL.Database();
        }
      } catch (e) {
        return reject(new Error(`Failed to reload database: ${e.message}`));
      }

      // We don't delete the log file here automatically to allow inspection,
      // but in a production loop we might want to.
      
      if (code === 0) {
        resolve(newDb);
      } else {
        reject(new Error(`Subagent exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { runSubagent };
