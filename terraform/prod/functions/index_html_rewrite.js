function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // パスに拡張子がない場合はSPAのルートindex.htmlを返す（React Routerがルーティングを処理）
  if (!uri.includes('.', uri.lastIndexOf('/'))) {
    request.uri = '/index.html';
  }

  return request;
}
