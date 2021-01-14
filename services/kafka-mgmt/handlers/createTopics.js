const { Kafka } = require("kafkajs");
const { ResourceTypes } = require("kafkajs");
const _ = require("lodash");

const kafkaTopics = [
  // {
  //   topic: 'a.test.topic.name',
  //   numPartitions: 10,
  //   replicationFactor: 3
  // }
];

function myHandler(event, context, callback) {
  const brokers = process.env.bootstrapBrokerStringTls.split(",");
  console.log("Received event:", JSON.stringify(event, null, 2));
  console.log("Brokers", JSON.stringify(brokers, null, 2));

  const kafka = new Kafka({
    clientId: "admin",
    brokers: brokers,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  var admin = kafka.admin();

  const createTopics = async () => {
    await admin.connect();

    //fetch topics from MSK and filter out __consumer_offsets internal management topic
    const existingTopicList = _.without(
      await admin.listTopics(),
      "__consumer_offsets"
    );
    console.log("Existing topics:", JSON.stringify(existingTopicList, null, 2));

    //fetch the metadata for the topics in MSK
    const topicsMetadata = _.get(
      await admin.fetchTopicMetadata({ topics: existingTopicList }),
      "topics",
      {}
    );
    console.log("Topics Metadata:", JSON.stringify(topicsMetadata, null, 2));

    //diff the existing topics array with the topic configuration collection
    const topicsToCreate = _.differenceWith(
      kafkaTopics,
      existingTopicList,
      (topicConfig, topic) => _.get(topicConfig, "topic") == topic
    );

    //find interestion of topics metadata collection with topic configuration collection
    //where partition count of topic in Kafka is less than what is specified in the topic configuration collection
    //...can't remove partitions, only add them
    const topicsToUpdate = _.intersectionWith(
      kafkaTopics,
      topicsMetadata,
      (topicConfig, topicMetadata) =>
        _.get(topicConfig, "topic") == _.get(topicMetadata, "name") &&
        _.get(topicConfig, "numPartitions") >
          _.get(topicMetadata, "partitions", []).length
    );

    //create a collection to update topic paritioning
    const paritionConfig = _.map(topicsToUpdate, function (topic) {
      return {
        topic: _.get(topic, "topic"),
        count: _.get(topic, "numPartitions"),
      };
    });

    //create a collection to allow querying of topic configuration
    const configOptions = _.map(topicsMetadata, function (topic) {
      return {
        name: _.get(topic, "name"),
        type: _.get(ResourceTypes, "TOPIC"),
      };
    });

    //query topic configuration
    const configs =
      configOptions.length != 0
        ? await admin.describeConfigs({ resources: configOptions })
        : [];

    console.log("Topics to Create:", JSON.stringify(topicsToCreate, null, 2));
    console.log("Topics to Update:", JSON.stringify(topicsToUpdate, null, 2));
    console.log(
      "Partitions to Update:",
      JSON.stringify(paritionConfig, null, 2)
    );
    console.log(
      "Topic configuration options:",
      JSON.stringify(configs, null, 2)
    );

    //create topics that don't exist in MSK
    await admin.createTopics({ topics: topicsToCreate });

    //if any topics have less partitions in MSK than in the configuration, add those partitions
    paritionConfig.length > 0 &&
      (await admin.createPartitions({ topicPartitions: paritionConfig }));

    await admin.disconnect();
  };

  createTopics();
}

exports.handler = myHandler;
