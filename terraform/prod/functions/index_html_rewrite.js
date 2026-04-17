function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    // /aws-quiz/ -> /aws-quiz/index.html
    request.uri += 'index.html';
  } else if (!uri.includes('.', uri.lastIndexOf('/'))) {
    // /aws-quiz -> /aws-quiz/index.html
    request.uri += '/index.html';
  }

  return request;
}
