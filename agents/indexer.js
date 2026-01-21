const { startSubagent } = require('../lib/intel/subagent-guest');

startSubagent(async (db, args, logger) => {
  logger.info('Indexer started', { args });

  // Simple proof of concept: Write a timestamp to a "meta" table
  // Ensure table exists
  db.run("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)");

  const stmt = db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)");
  stmt.run(['last_indexed', new Date().toISOString()]);
  stmt.free();

  logger.info('Updated last_indexed timestamp');
});
