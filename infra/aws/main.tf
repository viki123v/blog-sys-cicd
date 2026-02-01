#TODO: remove the public ips 

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

resource "aws_subnet" "eks_private_subnet1" {
  vpc_id            = data.aws_vpc.default.id
  cidr_block        = "172.31.0.0/27"
  availability_zone = "eu-central-1a"
  map_public_ip_on_launch = true  
  tags              = local.tags
}

resource "aws_subnet" "eks_private_subnet2" {
  vpc_id            = data.aws_vpc.default.id
  cidr_block        = "172.31.0.32/27"
  availability_zone = "eu-central-1b"
  map_public_ip_on_launch = true
  tags              = local.tags
}

module "eks" {
  source             = "terraform-aws-modules/eks/aws"
  version            = "~> 21.0"
  name               = local.cluster_name
  kubernetes_version = "1.35"

  addons = {
    kube-proxy = {}
    vpc-cni = {
      before_compute = true
      addon_version  = "v1.20.4-eksbuild.2"
    }
  }

  create_kms_key           = false
  attach_encryption_policy = false
  encryption_config        = null

  endpoint_public_access                   = true
  enable_cluster_creator_admin_permissions = true

  vpc_id = data.aws_vpc.default.id
  subnet_ids = [
    aws_subnet.eks_private_subnet1.id,
    aws_subnet.eks_private_subnet2.id
  ]

  compute_config = {
    enabled = false
  }

  eks_managed_node_groups = {
    default = {
      name           = "cicd1"
      ami_type       = "AL2023_x86_64_STANDARD"
      instance_types = ["t3.micro"]

      min_size     = 1
      max_size     = 3
      desired_size = 1
    }
  }

  tags = local.tags

  depends_on = [ 
    aws_subnet.eks_private_subnet1, 
    aws_subnet.eks_private_subnet2
  ]
}
