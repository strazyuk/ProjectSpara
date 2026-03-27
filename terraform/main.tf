terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # For a production setup, we recommend using an S3 backend for the state file.
  # For now, we'll use a local state.
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region
}

# ECR Repository for Backend Docker images
resource "aws_ecr_repository" "backend" {
  name                 = "projectspara-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
