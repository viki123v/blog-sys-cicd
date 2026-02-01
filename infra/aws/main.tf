locals {
  cluster_name = "cicd-project"
  tags = {
    Terraform = "true"
    College   = "true"
    Course    = "cicd"
  }
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_subnet" "eks_private_subnet" {
  vpc_id     = data.aws_vpc.default.id
  cidr_block = "172.31.0.0/27"
  tags       = local.tags
}

module "eks" {
  source             = "terraform-aws-modules/eks/aws"
  version            = "~> 21.0"
  name               = local.cluster_name

  addons = {
    kube-proxy = {}
    vpc-cni = {
      before_compute = true
      addon_version  = "v1.20.4-eksbuild.2"
    }
  }

  create_kms_key    = false
  attach_encryption_policy = false 
  encryption_config = null 

  endpoint_public_access                   = true
  enable_cluster_creator_admin_permissions = true

  vpc_id     = data.aws_vpc.default.id
  subnet_ids = [aws_subnet.eks_private_subnet.id]

  compute_config = {
    enabled = false
  }

  eks_managed_node_groups = {
    default = {
      name = "cicd1"
      ami_type       = "AL2_x86_64"
      instance_types = ["t3.micro"]

      min_size     = 1
      max_size     = 3
      desired_size = 2
    }
  }

  tags = local.tags
}
