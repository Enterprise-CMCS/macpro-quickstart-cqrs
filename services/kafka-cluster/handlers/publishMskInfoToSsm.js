var aws = require("aws-sdk");
var msk = new aws.Kafka({
  apiVersion: "2018-11-14",
});

function publishMskInfoToSsm(event, context, callback) {
  var params = {
    ClusterNameFilter: process.env.clusterName,
    MaxResults: "1",
  };
  msk.listClusters(params, function (err, data) {
    var clusterArn = "";
    var bootstrapBrokerStringTls = "";
    var zookeeperConnectString = "";
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {
      zookeeperConnectString = data.ClusterInfoList[0].ZookeeperConnectString;
      clusterArn = data.ClusterInfoList[0].ClusterArn;

      var params = {
        ClusterArn: clusterArn,
      };
      msk.getBootstrapBrokers(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          console.log(data);
          // The broker string is returned unsorted.  For idempotency, we need to sort it.
          bootstrapBrokerStringTls = data.BootstrapBrokerStringTls.split(",")
            .sort()
            .join(",");
          createSsmParameter(
            `${process.env.mskSsmPathPrefix}/bootstrapBrokerStringTls`,
            bootstrapBrokerStringTls
          );
          createSsmParameter(
            `${process.env.mskSsmPathPrefix}/zookeeperConnectString`,
            zookeeperConnectString
          );
          createSsmParameter(
            `${process.env.mskSsmPathPrefix}/clusterArn`,
            clusterArn
          );
        }
      });
    }
  });
  callback(null, "message");
}

function createSsmParameter(name, value) {
  var ssm = new aws.SSM();
  var getParams = {
    Name: name,
  };
  ssm.getParameter(getParams, function (err, data) {
    if (err || value !== data.Parameter.Value) {
      console.log(
        `SSM Parameter at ${name} requires creating or updating with new value:  ${value}.`
      );
      var putParams = {
        Name: name,
        Value: value,
        DataType: "text",
        Overwrite: true,
        Type: "String",
      };
      ssm.putParameter(putParams, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
      });
    } else {
      console.log(
        `SSM Parameter at ${name} is already up to date.  Not updating.`
      );
    }
  });
}

exports.handler = publishMskInfoToSsm;
