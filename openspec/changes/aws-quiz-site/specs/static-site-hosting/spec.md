## MODIFIED Requirements

### Requirement: CloudFrontがSPAのルーティングを正しく処理する
CloudFront FunctionはSPA（React）のルーティングに対応しなければならない（SHALL）。拡張子を持たない全てのパスはルートの `index.html` を返し、クライアントサイドのReact Routerにルーティングを委譲しなければならない（SHALL）。静的アセット（`.js`, `.css` 等、拡張子を持つパス）はそのまま配信されなければならない（SHALL）。

#### Scenario: サブパスへの直接アクセス
- **WHEN** ユーザーが `/aws-quiz` に直接アクセスする
- **THEN** CloudFrontが `dist/index.html` を返し、React Routerが `/aws-quiz` ルートを表示する

#### Scenario: 静的アセットへのアクセス
- **WHEN** ブラウザが `/assets/index-abc123.js` をリクエストする
- **THEN** CloudFrontが対応するJSファイルをそのまま返す

#### Scenario: ルートへのアクセス
- **WHEN** ユーザーが `/` にアクセスする
- **THEN** CloudFrontが `dist/index.html` を返し、React Routerがトップページを表示する
