
function myHandler(event, context, callback) {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var kafka = require('kafka-node');
  var client = new kafka.KafkaClient({
    kafkaHost: process.env.bootstrapBrokerStringTls,
    sslOptions: {
      rejectUnauthorized: false
    }
  });

  var topicsToCreate = [
    {
      topic: 'amendments',
      partitions: 1,
      replicationFactor: 3
    }
  ];
  client.createTopics(topicsToCreate, (error, result) => {
    if(error){
      console.log(error);
    } else {
      console.log(result);
    }
    client.close();
  });
}

exports.handler = myHandler;
