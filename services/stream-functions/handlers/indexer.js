
import * as elasticsearch from "./../libs/elasticsearch-lib";

const { ES_ENDPOINT, INDEX } = process.env;

function myHandler(event, context, callback) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  var buff = Buffer.from(event.records['amendments-0'][0].value, 'base64');
  var decodedEvent = JSON.parse(buff.toString('utf-8'));
  decodedEvent.Records.forEach(function(record) {
    console.log('Processing Record:', JSON.stringify(record, null, 2));
    switch(record.eventName) {
      case 'INSERT':
        elasticsearch.createDoc(ES_ENDPOINT,'us-east-1',INDEX,`${record.dynamodb.Keys.amendmentId.S}${record.dynamodb.Keys.userId.S}`,esDocument(record));
        break;
      case 'MODIFY':
        elasticsearch.updateDoc(ES_ENDPOINT,'us-east-1',INDEX,`${record.dynamodb.Keys.amendmentId.S}${record.dynamodb.Keys.userId.S}`,esDocument(record));
        break;
      case 'REMOVE':
        elasticsearch.deleteDoc(ES_ENDPOINT,'us-east-1',INDEX,`${record.dynamodb.Keys.amendmentId.S}${record.dynamodb.Keys.userId.S}`);
        break;
      default:
        console.log('Invalid or unknown event type; must be one of INSERT, MODIFY, REMOVE.');
        break;
    }

  });
}

function esDocument(record) {
  return {
    authProvider: record.dynamodb.NewImage.authProvider.S,
    createdAt: Number(record.dynamodb.NewImage.createdAt.N),
    firstName: record.dynamodb.NewImage.firstName.S,
    lastName: record.dynamodb.NewImage.lastName.S,
    comments: record.dynamodb.NewImage.comments.S,
    attachment: record.dynamodb.NewImage.attachment.S ? record.dynamodb.NewImage.attachment.S : null,
    amendmentId: record.dynamodb.NewImage.amendmentId.S,
    transmittalNumber: record.dynamodb.NewImage.transmittalNumber.S,
    urgent: record.dynamodb.NewImage.urgent.BOOL,
    userId: record.dynamodb.NewImage.userId.S,
    email: record.dynamodb.NewImage.email.S,
    territory: record.dynamodb.NewImage.territory.S,
  };
}

exports.handler = myHandler;
