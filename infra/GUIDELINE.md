# Terraformのガイドライン

## はじめに

このガイドラインはフューチャー株式会社の[Terraform設計ガイドライン](https://future-architect.github.io/arch-guidelines/documents/forTerraform/terraform_guidelines.html)をベースに作成したものである。

## 適用範囲

対象とする技術は以下を想定している。

* Terraform 1.10+
* OSS利用のみ（HCP Terraformは利用しない）
* AWS、Google Cloud、Azureなどのクラウドサービスに対しての利用

利用者は以下の技術を理解しているとし、本ガイドラインではこれらについて解説はしない。

* 基本的なTerraformの知識と理解
* Gitの基本的な知識
* CI/CDの基本的な知識

本ガイドラインの適用範囲は、Terraformの設計、開発時に利用することを想定している。クラウドサービス上の技術選定、サービス設計の手法については本ガイドラインで対象外とする。

## 用語について

* ルートモジュール
    * terraformコマンドを実行するディレクトリ上にある .tf リソース
* モジュール
    * 本ガイドラインでは、ルートモジュールから利用される子モジュールのことを指す

## 命名規則

推奨は以下の通り。

* アンダースコア区切り（例: example_variable_name）
* リソース種別をリソース名に含めない
* リソース タイプと名前を二重引用符で囲む

## 基本文法

コーディング規約の基本的な内容を示す。

### コメント

* コメントは`#`を用いる

### 変数

Terraformの変数には以下の2種類がある。

* [Input Variables](https://developer.hashicorp.com/terraform/language/values/variables)
    * Terraformの入力値を定義するために使用する。モジュールではほぼ必須で扱う
* [Local Values](https://developer.hashicorp.com/terraform/language/values/locals)
    * Terraform設定内でのみ使用される内部の値を定義するために使用する

推奨は以下の通り。

* 外部からのインプットにしたい場合のみ Input Variables を利用する
    * Input Variables を利用する場合は、全ての変数に`type`と`description`を含める
* ファイル内で閉じて利用する変数は Local Values を利用する

### コレクション型

Terraformではコレクション型として、tuple、list、map、objectといったデータ形式が提供されている。

* tuple
    * 固定長の要素のペア
* list
    * 同じ型で任意数の要素を保持
* map
    * キーと値のペア。タグのようなフラットな構造で利用
* object
    * 異なる型のプロパティを持つ複数の属性を格納する。構造的なデータの場合に利用

推奨は以下の通り。

* 値の意味が不明瞭になりがちな`tuple`は利用せず、代わりに`list`, `map`, `object`を利用する
* 値の型が固定化できない場合は`map`ではなく`object`を利用する
* モジュールの引数には`map`ではなく`object`を利用する(キーが明示的に宣言できるため)
* `list`, `list(any)`は利用せず、`list(string)`などの型宣言をする
* `map`, `map(any)`は利用せず、`map(string)`などの型宣言をする

参考: [Types and Values](https://developer.hashicorp.com/terraform/language/expressions/types#maps-objects)

### any型

* 原則`any`は利用しない
* できる限り`object`など具体的な型に代替できないか考える

### リソース属性参照

`{resource種別}.{resource名}.{属性}`の形式でリソース名を参照できる。

推奨は以下の通り。

* ハードコードではなく、できる限りリソース属性参照を利用する

### countとfor_each

* 原則`count`ではなく`for_each`を利用する
    * `for_each`のキーにリソース属性参照した値を設定する場合は、依存する属性が常にknown valueである場合のみを許容する
    * `count`の利用はリソース作成有無 (0/1) の場合にのみ絞る。例えば、ルートモジュール上でdev環境はリソースを作成しないといった定義に用いる

## プロジェクト共通のタグ

AWS Providerではデフォルトのタグを設定できる。全てのリソースに振り下ろして良い内容である場合は、Provider側で定義することで各リソース側の定義をシンプルに保つことができる。なお、各リソース側で同名のタグ名を指定した場合は、各リソース側の値が優先して使用される。

推奨は以下の通り。

* プロジェクトで用いる共通的なタグはProvider側で定義する
* 共通的なタグの値の上書きは一部のリソースであれば許容する

## IAM Policyの書き方（AWS）

* Data Sourceの[iam_policy_document](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document)を利用する

## Data Sourceの引数に他のリソースを直接参照させない

Data Sources には以下の仕様がある。

* Data Sourceの引数が他のリソースを直接参照している場合、参照先のリソースがData Sourceの`depends_on`に含まれている場合と同じように扱われる
    * ≒ Data Sourceが直接参照しているリソースに変更がある場合、それらの変更が適用された後でData Sourceの読み取りが再実行される
    * ≒ Data Source自体を変更していないのに、リソースに`known after apply`という差分が出てしまう

推奨は以下の通り。

* Data Sourceの引数に他のリソースは直接参照させず、Local変数経由とする

## スタンドアローンリソースとインライン

[aws_route_table](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route_table)のように、スタンドアローンのリソースとインラインで定義できるリソースの2種類が提供されている場合がある。

例1: スタンドアローンのリソース

```hcl
resource "aws_vpc" "example" {...}

resource "aws_internet_gateway" "example" {...}

resource "aws_route_table" "example" {
  vpc_id = aws_vpc.example.id
}

resource "aws_route" "example_route" {
  route_table_id         = aws_route_table.example.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.example.id
}
```

例2: インラインで定義できるリソース

```hcl
resource "aws_vpc" "example" {...}

resource "aws_internet_gateway" "example" {...}

resource "aws_route_table" "example" {
  vpc_id = aws_vpc.example.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.example.id
  }
}
```

推奨は以下の通り。

* スタンドアローンリソースを利用する
    * 可読性は多少低下するが、ルート追加などの作業で余計な差分が出て運用負荷が上がってしまうことを避けるため
    * インラインでdynamicブロックなどを用いてループさせる場合、パラメータがまして複雑になることを避けるため

## 削除保護

* クラウドリソースの削除保護を有効化する
    * `enable_deletion_protection`や`deletion_protection`を有効にする

## リソースの宣言順

* リソース間に依存関係があれば、依存関係の親から子の順番に記載する

## リソースのパラメータ順

1. 存在する場合は`count`や`for_each`
2. リソースが定義するノンブロックパラメータ
    * ノンブロックパラメータ同士は、マニュアルの記載順にする
3. リソースが定義するブロックパラメータ
4. `lifecycle`
5. `depends_on`
6. タグなど、全リソース共通的に指定可能なパラメータ

## シンボリックリンク

* シンボリックリンク可能なファイルは`terraform.tf`, `providers.tf`のみとする
* シンボリックリンクの元ファイルは、ルートフォルダか`shared`フォルダにあるファイルのみに限る

## モジュール

### 入力設計

* できる限り入力パラメータの数を減らす
* 入力パラメータはできる限りデフォルト値を設定とし、パラメータ指定なしでも動くようにする
    * ただし、誤ったリソース作成がなされる可能性がある場合は必須入力とする

### サードパーティモジュールの利用方針

* 原則、利用禁止とする

## カスタムメッセージ

* `validation`
    * 可能な限り設定する
* `precondition`
    * 可能な限り`validation`でチェックする
    * `validation`でチェックが不可な、その他のオブジェクトを参照したチェックを行いたい場合に利用する
    * 原則、モジュールを開発する場合に利用する
* `postcondition`
    * 可能な限り`validation`, `precondition`でチェックする
    * 原則、モジュールを開発する場合に利用する

## バージョニング

### Terraform自体のバージョン管理

* パッチバージョンまで完全一致で固定する

### Providerのバージョン管理

* パッチバージョンまで完全一致で固定する

## 開発フロー

### フォーマッター

* `terraform fmt -recursive`を利用する

### リンター

以下を利用する。

* `terraform fmt -check`
* `terraform validate`
* `tflint`
* `trivy`
    * `tfsec`は`trivy`の移行を推奨しているため利用しない
    * `trivy`は`CRITICAL`, `HIGH`は最低でもチェックする

### コミットフック

以下を利用する。

* `terraform fmt`
* `terraform validate`

## ディレクトリ構成

推奨は以下の通り。

## 参考資料

* [Terraform設計ガイドライン | フューチャー株式会社](https://future-architect.github.io/arch-guidelines/documents/forTerraform/terraform_guidelines.html)
* [コードベースの構造と組織のベストプラクティス - AWS 規範ガイダンス](https://docs.aws.amazon.com/ja_jp/prescriptive-guidance/latest/terraform-aws-provider-best-practices/structure.html)
* [最低限のTerraformコード規約を定義した | Zenn](https://zenn.dev/coconala/articles/create_code_policy)
