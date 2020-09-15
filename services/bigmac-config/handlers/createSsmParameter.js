var crypto = require('crypto');
var aws = require('aws-sdk');
aws.config.update({region: 'us-east-1'});
var msk = new aws.Kafka({
  apiVersion: '2018-11-14'
});
var ssm = new aws.SSM();
var mskConfig = require('./../libs/customMskConfiguration').mskConfig;

function createSsmParameter(event, context, callback) {
  var hash = crypto.createHash('md5').update(mskConfig).digest('hex');
  var thisConfigName = `${process.env.mskConfigurationNamePrefix}-${hash}`;

  msk.listConfigurations({}, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      context.fail(err);
    } else {
      var arn = "";
      data.Configurations.forEach(element => {
        if(element.Name === thisConfigName ) {
          arn = element.Arn;
        }
      });
      var params = {
        Name: process.env.ssmParameterPath,
        Value: arn,
        DataType: 'text',
        Overwrite: true,
        Type: 'String'
      };
      ssm.putParameter(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else     console.log(data);
      });
    }
  });
  callback(null, "message");
}

exports.handler = createSsmParameter;
