const fs = require('fs');
const { startSubagent } = require('../lib/intel/subagent-guest');
const { generateEntities } = require('../lib/intel/analyzer');

// Graph schema (idempotent)
const SCHEMA = `
CREATE TABLE IF NOT EXISTS nodes (
  body TEXT,
  id TEXT GENERATED ALWAYS AS (json_extract(body, '$.id')) VIRTUAL NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS id_idx ON nodes(id);

CREATE TABLE IF NOT EXISTS edges (
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  relationship TEXT DEFAULT 'depends_on',
  UNIQUE(source, target, relationship) ON CONFLICT REPLACE
);
CREATE INDEX IF NOT EXISTS source_idx ON edges(source);
CREATE INDEX IF NOT EXISTS target_idx ON edges(target);
`;

startSubagent(async (db, args, logger) => {
  logger.info('Indexer started', { argsCount: args.length });

  // 1. Ensure schema
  db.run(SCHEMA);

  // 2. Determine file list
  let files = [];
  if (args.length === 1 && args[0].endsWith('.json')) {
    try {
      const manifest = fs.readFileSync(args[0], 'utf8');
      files = JSON.parse(manifest);
    } catch (e) {
      logger.error('Failed to read manifest', { error: e.message });
      process.exit(1); // subagent-guest catches this but we can exit early
    }
  } else {
    files = args;
  }

  logger.info(`Processing ${files.length} files`);

  // 3. Process files
  const stmtNode = db.prepare('INSERT OR REPLACE INTO nodes (body) VALUES (?)');
  const stmtEdge = db.prepare('INSERT OR REPLACE INTO edges (source, target) VALUES (?, ?)');

  let processed = 0;
  db.exec('BEGIN TRANSACTION');

  try {
    for (const filePath of files) {
      if (!fs.existsSync(filePath)) {
        // Only warn if it's not a deletion (which we handle by ignoring for now)
        logger.warn(`File not found: ${filePath}`);
        continue;
      }

      // Check if directory
      if (fs.statSync(filePath).isDirectory()) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const entity = generateEntities(content, filePath);

      // Upsert Node
      stmtNode.run([JSON.stringify(entity)]);

      // Upsert Edges (Imports)
      // Note: We currently don't clear old edges for this source.
      // REPLACE on unique constraint handles duplicates, but not deletions.
      // To handle deletions, we should DELETE FROM edges WHERE source = entity.id first.
      
      // Clear old edges for this file to keep graph accurate
      db.run('DELETE FROM edges WHERE source = ?', [entity.id]);

      for (const imp of entity.imports) {
        // Simplified: source=filePath, target=importPath
        // The analyzer returns raw import strings.
        // We'll store them as targets. Resolution happens at query time or in a separate pass.
        stmtEdge.run([entity.id, imp]);
      }

      processed++;
      if (processed % 50 === 0) {
        logger.info(`Processed ${processed}/${files.length}`);
      }
    }

    db.exec('COMMIT');
    stmtNode.free();
    stmtEdge.free();

    logger.info(`Indexing complete. Processed ${processed} files.`);
  } catch (e) {
    logger.error('Indexing transaction failed', { error: e.message });
    try { db.exec('ROLLBACK'); } catch (e2) {}
    throw e;
  }
});