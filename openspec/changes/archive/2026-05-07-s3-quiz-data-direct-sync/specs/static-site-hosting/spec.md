## MODIFIED Requirements

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
