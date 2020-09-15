
const bootstrapBrokerStringTls = process.env.BOOTSTRAP_BROKER_STRING_TLS;

function myHandler(event, context, callback) {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var kafka = require('kafka-node');
  var Producer = kafka.Producer;
  var client = new kafka.KafkaClient({
    kafkaHost: bootstrapBrokerStringTls,
    sslOptions: {
      rejectUnauthorized: false
    }
  });
  var producer = new Producer(client);
  var payloads = [
    { topic: 'amendments', messages: [JSON.stringify(event, null, 2)] }
  ];
  producer.on('ready', function () {
    producer.send(payloads, function (error, data) {
      if (error) {
        console.log(error);
      }
      else {
        console.log(data);
        producer.close();
      }
    });
  });
}

exports.handler = myHandler;
