const fs = require('fs');
const initSqlJs = require('sql.js/dist/sql-asm.js');

/**
 * Standard guest wrapper for subagent processes.
 * Handles DB loading, saving, and standardized logging.
 *
 * @param {Function} workCallback - Async function(db, args, logger) to execute.
 */
async function startSubagent(workCallback) {
  // Args provided by subagent-host: [node, script, dbPath, logFile, ...customArgs]
  const args = process.argv.slice(2);
  const dbPath = args[0];
  const logFile = args[1];
  const customArgs = args.slice(2);

  if (!dbPath || !logFile) {
    console.error('Usage: node script.js <dbPath> <logFile> [args...]');
    process.exit(1);
  }

  // Logger helper
  const logger = {
    log: (level, message, meta = {}) => {
      const line = JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta
      }) + '\n';
      try {
        fs.appendFileSync(logFile, line);
      } catch (e) {
        // Fallback to stderr if log file fails
        console.error('Failed to write log:', e.message);
      }
    },
    info: (msg, meta) => logger.log('info', msg, meta),
    error: (msg, meta) => logger.log('error', msg, meta),
    warn: (msg, meta) => logger.log('warn', msg, meta)
  };

  try {
    logger.info('Subagent starting', { pid: process.pid, script: process.argv[1] });

    // Initialize DB
    const SQL = await initSqlJs();
    let db;
    if (fs.existsSync(dbPath)) {
      const filebuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
    } else {
      db = new SQL.Database();
    }

    // Execute work
    await workCallback(db, customArgs, logger);

    // Persist DB
    // We assume db is still open. workCallback should NOT close it.
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    db.close();

    logger.info('Subagent completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Subagent failed', { error: error.message, stack: error.stack });
    console.error(error);
    process.exit(1);
  }
}

module.exports = { startSubagent };
