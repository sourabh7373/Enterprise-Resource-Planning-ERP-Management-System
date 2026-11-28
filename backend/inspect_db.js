const mongoose = require('mongoose');
require('dotenv').config();

async function inspectAllDbs() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017');
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    
    for (const dbInfo of dbs.databases) {
      const dbConn = mongoose.createConnection('mongodb://127.0.0.1:27017/' + dbInfo.name);
      await dbConn.asPromise();
      const collections = await dbConn.db.listCollections().toArray();
      console.log('=== DB: ' + dbInfo.name + ' ===', collections.map(c => c.name));
      if (collections.some(c => c.name === 'approvalrequests')) {
        const docs = await dbConn.db.collection('approvalrequests').find({}).toArray();
        console.log('  approvalrequests count:', docs.length);
        docs.forEach(d => console.log(JSON.stringify(d, null, 2)));
      }
      if (collections.some(c => c.name === 'workflows')) {
        const docs = await dbConn.db.collection('workflows').find({}).toArray();
        console.log('  workflows count:', docs.length);
        docs.forEach(d => console.log(JSON.stringify(d, null, 2)));
      }
      await dbConn.close();
    }
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
}
inspectAllDbs();
