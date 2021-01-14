function myHandler(event, context, callback) {
  console.log("Received event:", JSON.stringify(event, null, 2));
  console.log(process.env.legacydbIp);
  var sql = require("mssql");
  const user = process.env.initialAdmin;
  const password = process.env.initialPassword;
  const server = process.env.legacydbIp;
  var config = {
    user: user,
    password: password,
    server: server,
  };
  sql.connect(config, function (err) {
    if (err) console.log(err);
    let sqlRequest = new sql.Request();
    sqlRequest.query(
      `
      IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = N'aps')
      CREATE DATABASE [aps]
    `,
      function (err, recordset) {
        if (err) console.log(err);
        console.log(JSON.stringify(recordset, null, 2));
      }
    );
    sqlRequest.query(
      `
      USE aps;
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='amendments' and xtype='U')
        CREATE TABLE amendments(
          id INTEGER IDENTITY(1,1) NOT NULL PRIMARY KEY,
          changed_on DATETIME NOT NULL DEFAULT GETDATE(),
          amendmentId VARCHAR(255) NOT NULL,
          territory VARCHAR(255),
          created_by VARCHAR(50)
        );
    `,
      function (err, recordset) {
        if (err) console.log(err);
        console.log(JSON.stringify(recordset, null, 2));
        sql.close();
      }
    );
  });
}

exports.handler = myHandler;
