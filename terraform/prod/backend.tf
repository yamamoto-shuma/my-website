terraform {
  backend "s3" {
    bucket = "my-website-prod-tfstate"
    key    = "terraform.tfstate"
    region = "ap-northeast-1"
  }
}
