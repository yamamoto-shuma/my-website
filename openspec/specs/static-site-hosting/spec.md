## ADDED Requirements

### Requirement: S3バケットがプライベートで静的コンテンツを格納できる
静的HTMLコンテンツを格納するS3バケットが存在し、パブリックアクセスを全ブロック、バージョニング有効、SSE-S3暗号化が設定されていなければならない（SHALL）。バケットへの直接アクセスは禁止し、CloudFront OAC経由のみを許可するバケットポリシーが設定されていなければならない（SHALL）。

#### Scenario: バケットがプライベートで作成される
- **WHEN** `terraform/prod/` で `terraform apply` を実行する
- **THEN** S3バケットが作成され、パブリックアクセスが全ブロック、バージョニングが有効、SSE-S3暗号化が設定されている

#### Scenario: CloudFront以外からのアクセスが拒否される
- **WHEN** S3バケットに直接アクセスする（署名なしリクエスト）
- **THEN** `AccessDenied` エラーが返される

### Requirement: CloudFront DistributionがOACでS3をオリジンとして配信する
CloudFront DistributionがS3をオリジンとし、OAC（Origin Access Control）経由でSigV4署名付きリクエストでアクセスする設定でなければならない（SHALL）。PriceClassは `PriceClass_200` でなければならない（SHALL）。HTTPSのみを許可し（HTTP→HTTPSリダイレクト）、デフォルトルートオブジェクトは `index.html` でなければならない（SHALL）。クイズデータ（`/data/questions/*.json`）もCloudFront経由で配信されなければならない（SHALL）。

#### Scenario: CloudFront経由でindex.htmlが配信される
- **WHEN** CloudFrontのドメインに対してHTTPSリクエストを送る
- **THEN** S3の `index.html` が返される（200 OK）

#### Scenario: HTTPリクエストがHTTPSにリダイレクトされる
- **WHEN** CloudFrontのドメインに対してHTTPリクエストを送る
- **THEN** 301リダイレクトでHTTPSのURLに転送される

#### Scenario: PriceClassがPriceClass_200である
- **WHEN** CloudFront Distributionの設定を確認する
- **THEN** `price_class = "PriceClass_200"` が設定されている

#### Scenario: クイズデータがCloudFront経由で取得できる
- **WHEN** `https://{cloudfront-domain}/data/questions/iam.json` にGETリクエストを送る
- **THEN** IAMのクイズJSON（200 OK）が返される

### Requirement: ガイドライン準拠のTerraformコードである
`terraform/GUIDELINE.md` に定められたコーディング規約に従ったコードでなければならない（SHALL）。

#### Scenario: バージョンがパッチバージョンまで固定されている
- **WHEN** `terraform.tf` の `required_providers` を確認する
- **THEN** TerraformおよびAWS Providerのバージョンがパッチバージョンまで完全一致で固定されている

#### Scenario: 命名規則がアンダースコア区切りである
- **WHEN** リソース定義を確認する
- **THEN** リソース名がアンダースコア区切り（snake_case）で記述されている
