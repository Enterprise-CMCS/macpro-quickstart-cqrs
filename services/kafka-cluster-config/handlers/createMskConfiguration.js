var crypto = require("crypto");
var aws = require("aws-sdk");
var msk = new aws.Kafka({
  apiVersion: "2018-11-14",
});
var mskConfig = require("./../libs/customMskConfiguration").mskConfig;

function createMskConfiguration(event, context, callback) {
  var hash = crypto.createHash("md5").update(mskConfig).digest("hex");
  var thisConfigName = `${process.env.mskConfigurationNamePrefix}-${hash}`;
  msk.listConfigurations({}, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      context.fail(err);
    } else {
      var configNames = [];
      data.Configurations.forEach((element) => {
        configNames.push(element.Name);
      });
      if (configNames.includes(thisConfigName)) {
        console.log("MSK Config already exists");
      } else {
        console.log("Creating a new MSK Config");
        var params = {
          Name: thisConfigName,
          ServerProperties: mskConfig,
          Description: "created from lambda",
        };
        msk.createConfiguration(params, function (err, data) {
          if (err) console.log(err, err.stack);
          else {
            console.log(data);
          }
        });
      }
    }
  });
  callback(null, "message");
}

exports.handler = createMskConfiguration;
