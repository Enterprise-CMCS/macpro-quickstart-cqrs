const _ = require("lodash");

function myHandler(event, context, callback) {
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }
  console.log("Received event:", JSON.stringify(event, null, 2));
  var value = JSON.parse(event.value);

  var sql = require("mssql");
  const user = process.env.legacydbUser;
  const password = process.env.legacydbPassword;
  const server = process.env.legacydbIp;
  const port = parseInt(process.env.legacydbPort);
  var config = {
    user: user,
    password: password,
    server: server,
    port: port,
    database: "SEA",
  };
  sql.connect(config, function (err) {
    if (err) console.log(err);
    value.Records.forEach(function (record) {
      if (record.eventName !== "INSERT") {
        console.log(
          `Current record is of type ${record.eventName}.  Doing nothing since it is not of type INSERT`
        );
        return;
      }
      console.log(JSON.stringify(record, null, 2));
      const transaction = new sql.Transaction();
      transaction.begin((err) => {
        if (err) console.log(err);

        let sqlRequest = new sql.Request();
        sqlRequest.on("info", (info) => {
          console.log(info);
        });
        const recordItem = _.get(record, "dynamodb.NewImage");
        var mynewquery = `
          Insert into SEA.dbo.State_Plan (ID_Number, State_Code, Region_ID, Plan_Type, Submission_Date, SPW_Status_ID, Status_Date, Summary_Memo, Budget_Neutrality_Established_Flag)
              values ('${_.get(recordItem, "transmittalNumber.S")}'
               ,'${_.get(recordItem, "territory.S")}'
               ,(Select Region_ID from SEA.dbo.States where State_Code = '${_.get(
                 recordItem,
                 "territory.S"
               )}')
               ,(Select Plan_Type_ID from SEA.dbo.Plan_Types where Plan_Type_Name = '${_.get(
                 recordItem,
                 "type_mapped.S"
               )}')
               ,dateadd(s, convert(int, left(${_.get(
                 recordItem,
                 "createdAt.N"
               )}, 10)), cast('19700101' as datetime))
               ,(Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = '${_.get(
                 recordItem,
                 "status.S"
               )}')
               ,dateadd(s, convert(int, left(${_.get(
                 recordItem,
                 "createdAt.N"
               )}, 10)), cast('19700101' as datetime))
               ,'${_.get(recordItem, "summary.S")}'
               ,0)
          `;
        console.log(mynewquery);
        sqlRequest.query(mynewquery, function (err, recordset) {
          if (err) console.log(err);
          console.log("Transaction committed.");
          console.log(JSON.stringify(recordset, null, 2));
          transaction.commit((err) => {
            if (err) console.log(err);
            console.log("Transaction committed.");
          });
          sql.close();
        });
      });
    });
  });
}

exports.handler = myHandler;
