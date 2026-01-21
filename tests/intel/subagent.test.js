const fs = require('fs');
const path = require('path');
const { runSubagent } = require('../../lib/intel/subagent-host');
const initSqlJs = require('sql.js/dist/sql-asm.js');
const assert = require('assert');

// Test setup
const testDir = path.join(__dirname, 'tmp_subagent_test');
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

const dbPath = path.join(testDir, 'test.db');
const agentScript = path.join(__dirname, '../../agents/indexer.js');

async function testHandoff() {
  console.log('Running testHandoff...');
  const SQL = await initSqlJs();
  let db = new SQL.Database();

  // Create table in parent
  db.run("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)");
  db.run("INSERT INTO meta (key, value) VALUES (?, ?)", ['parent_init', 'true']);

  // Run subagent (indexer.js writes 'last_indexed')
  db = await runSubagent(db, dbPath, agentScript, []);

  // Verify parent sees changes
  const res = db.exec("SELECT value FROM meta WHERE key = 'last_indexed'");
  assert.ok(res.length > 0, 'Subagent write should be visible');
  const val = res[0].values[0][0];
  assert.ok(val, 'Value should be present');
  console.log('testHandoff PASSED');
  
  if (db) db.close();
}

async function testCrash() {
  console.log('Running testCrash...');
  const SQL = await initSqlJs();
  let db = new SQL.Database();
  
  // Create a crasher script
  const crasherScript = path.join(testDir, 'crasher.js');
  fs.writeFileSync(crasherScript, `
    const { startSubagent } = require('../../../lib/intel/subagent-guest');
    startSubagent(async () => {
      throw new Error('Boom');
    });
  `);

  try {
    await runSubagent(db, dbPath, crasherScript, []);
    assert.fail('Should have thrown');
  } catch (e) {
    assert.ok(e.message.includes('Subagent exited with code 1'), 'Should catch exit code 1');
    console.log('testCrash PASSED');
  }
}

async function run() {
  try {
    await testHandoff();
    await testCrash();
    console.log('ALL TESTS PASSED');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
  }
}

run();
