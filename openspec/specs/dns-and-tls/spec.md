## ADDED Requirements

### Requirement: ACM証明書がus-east-1に作成されカスタムドメインに適用される
カスタムドメイン（apex）に対するACM証明書がus-east-1リージョンに作成され、DNS検証が完了した状態でなければならない（SHALL）。CloudFront Distributionにこの証明書が紐付けられていなければならない（SHALL）。

#### Scenario: ACM証明書がus-east-1で発行される
- **WHEN** `terraform/prod/` で `terraform apply` を実行する
- **THEN** us-east-1リージョンにACM証明書が作成され、ステータスが `ISSUED` になっている

#### Scenario: CloudFrontに証明書が適用されている
- **WHEN** CloudFront Distributionの設定を確認する
- **THEN** us-east-1のACM証明書ARNが `viewer_certificate` に設定されている

#### Scenario: カスタムドメインでHTTPS通信できる
- **WHEN** カスタムドメイン（apex）に対してHTTPSリクエストを送る
- **THEN** 有効なTLS証明書で接続が確立し、コンテンツが返される

### Requirement: Route53のHosted ZoneにAliasレコードが設定される
Route53にカスタムドメインのHosted Zoneが存在し、apexドメインからCloudFront DistributionへのAliasレコード（A/AAAA）が設定されていなければならない（SHALL）。

#### Scenario: AレコードがCloudFrontに向いている
- **WHEN** Route53のHosted Zoneを確認する
- **THEN** apexドメインのAレコードがCloudFront DistributionのドメインへのAliasとして設定されている

#### Scenario: apexドメインで名前解決できる
- **WHEN** apexドメインに対してDNSクエリを実行する
- **THEN** CloudFrontのIPアドレスが返される
