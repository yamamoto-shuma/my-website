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

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "my-website"
      Environment = "prod"
      ManagedBy   = "terraform"
    }
  }
}
