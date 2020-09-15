
var aws = require('aws-sdk');
aws.config.update({region: 'us-east-1'});
var msk = new aws.Kafka({
  apiVersion: '2018-11-14'
});

function publishMskInfoToSsm(event, context, callback) {

  console.log('asdf');
  var params = {
    ClusterNameFilter: process.env.clusterName,
    MaxResults: '1'
  };
  msk.listClusters(params, function(err, data) {
    var clusterArn = "";
    var bootstrapBrokerStringTls = "";
    var zookeeperConnectString = "";
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else  {
      console.log(data);
      zookeeperConnectString = data.ClusterInfoList[0].ZookeeperConnectString;
      clusterArn = data.ClusterInfoList[0].ClusterArn;

      var params = {
        ClusterArn: clusterArn
      };
      msk.getBootstrapBrokers(params, function(err, data) {
        if(err) {
          console.log(err, err.stack);
        } else {
          console.log(data);
          bootstrapBrokerStringTls = data.BootstrapBrokerStringTls;
          createSsmParameter(`${process.env.mskSsmPathPrefix}/bootstrapBrokerStringTls`, bootstrapBrokerStringTls);
          createSsmParameter(`${process.env.mskSsmPathPrefix}/zookeeperConnectString`, zookeeperConnectString);
          createSsmParameter(`${process.env.mskSsmPathPrefix}/clusterArn`, clusterArn);
        }
      });

    }
  });
  callback(null, "message");
}

function createSsmParameter(name, value) {
  var ssm = new aws.SSM();
  var params = {
    Name: name,
    Value: value,
    DataType: 'text',
    Overwrite: true,
    Type: 'String'
  };
  ssm.putParameter(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else     console.log(data);
  });
}

exports.handler = publishMskInfoToSsm;
