provider "aws" {
  region = "ap-northeast-1"

  default_tags {
    tags = {
      Project     = "my-website"
      Environment = "prod"
      ManagedBy   = "terraform"
    }
  }
}
