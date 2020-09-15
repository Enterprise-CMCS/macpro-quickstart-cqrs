import AWS from "aws-sdk";

export function createDoc(domain, region, index, docId, docBody) {
  // Note, this is identical to updateDoc.
  // ES documentation said you must use _create when first creating a document
  // But that hasn't been observed to be true
  // We will use _doc instead of _create since we can
  // But, we will leave these functions as separate in the event we want different behavior later.
  var method = 'PUT';
  var path = `${index}/_doc/${docId}`;
  makeSignedRequest(domain, region, method, path, docBody);
}

export function updateDoc(domain, region, index, docId, docBody) {
  var method = 'PUT';
  var path = `${index}/_doc/${docId}`;
  makeSignedRequest(domain, region, method, path, docBody);
}

export function deleteDoc(domain, region, index, docId) {
  var method = 'PUT';
  var path = `${index}/_doc/${docId}`;
  makeSignedRequest(domain, region, method, path);
}

export function deleteIndex(domain, region, index) {
  var method = 'DELETE';
  var path = index;
  makeSignedRequest(domain, region, method, path);
}

export function createIndex(domain, region, index) {
  var method = 'PUT';
  var path = index;
  makeSignedRequest(domain, region, method, path);
}

export function addMapping(domain, region, index, mapping) {
  var method = 'PUT';
  var path = `${index}/_mapping`;
  makeSignedRequest(domain, region, method, path, mapping);
}

export function makeSignedRequest(domain, region, method, path, body = {}) {
  var endpoint = new AWS.Endpoint(domain);
  var request = new AWS.HttpRequest(endpoint, region);
  request.method = method;
  request.path += path;
  request.body = JSON.stringify(body, null, 2);
  request.headers['host'] = domain;
  request.headers['Content-Type'] = 'application/json';
  request.headers['Content-Length'] = Buffer.byteLength(request.body);

  var credentials = new AWS.EnvironmentCredentials('AWS');
  var signer = new AWS.Signers.V4(request, 'es');
  signer.addAuthorization(credentials, new Date());
  var client = new AWS.HttpClient();
  client.handleRequest(request, null, function(response) {
    console.log(response.statusCode + ' ' + response.statusMessage);
    var responseBody = '';
    response.on('data', function (chunk) {
      responseBody += chunk;
    });
    response.on('end', function (chunk) {
      console.log('Response body: ' + responseBody);
    });
  }, function(error) {
    console.log('Error: ' + error);
  });
}
