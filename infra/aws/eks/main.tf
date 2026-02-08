locals {
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
  vpc_id                  = data.aws_vpc.default.id
  cidr_block              = "172.31.0.128/25"
  availability_zone       = "eu-central-1a"
  map_public_ip_on_launch = true
  tags = merge(local.tags, {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  })
}

resource "aws_subnet" "eks_private_subnet2" {
  vpc_id                  = data.aws_vpc.default.id
  cidr_block              = "172.31.0.0/25"
  availability_zone       = "eu-central-1b"
  map_public_ip_on_launch = true
  tags = merge(local.tags, {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  })
}

data "aws_route_table" "default" {
  vpc_id = data.aws_vpc.default.id

  filter {
    name   = "association.main"
    values = ["true"]
  }
}

resource "aws_route_table_association" "eks_subnet1" {
  subnet_id      = aws_subnet.eks_private_subnet1.id
  route_table_id = data.aws_route_table.default.id
}

resource "aws_route_table_association" "eks_subnet2" {
  subnet_id      = aws_subnet.eks_private_subnet2.id
  route_table_id = data.aws_route_table.default.id
}

module "ebs_csi_driver_irsa" {
  source = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts"

  name = "ebs-csi"

  attach_ebs_csi_policy = true

  oidc_providers = {
    this = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }

  tags = local.tags 
}

module "efs_csi_driver_irsa" {
  source = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts"

  name = "AmazonEKS_EFS_CSI_DriverRole"

  attach_efs_csi_policy = true

  trust_condition_test = "StringLike"

  oidc_providers = {
    this = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:efs-csi-*"]
    }
  }

  tags = local.tags
}

resource "aws_efs_file_system" "blogwalk-fs" {
  creation_token = "blogwalk-imgs"
  tags = local.tags
}

resource "aws_efs_mount_target" "subnet1" {
  file_system_id  = aws_efs_file_system.blogwalk-fs.id
  subnet_id       = aws_subnet.eks_private_subnet1.id
  security_groups = [module.eks.node_security_group_id]
}

resource "aws_efs_mount_target" "subnet2" {
  file_system_id  = aws_efs_file_system.blogwalk-fs.id
  subnet_id       = aws_subnet.eks_private_subnet2.id
  security_groups = [module.eks.node_security_group_id]
}

module "eks" {
  source             = "terraform-aws-modules/eks/aws"
  version            = "~> 21.0"
  name               = var.cluster_name
  kubernetes_version = "1.35"

  addons = {
    kube-proxy = {}
    vpc-cni = {
      before_compute = true
      addon_version  = "v1.21.1-eksbuild.3"
    }
    coredns = {}
    aws-ebs-csi-driver = {
      service_account_role_arn    = module.ebs_csi_driver_irsa.arn
      addon_version               = "v1.55.0-eksbuild.2"
      resolve_conflicts_on_create = "OVERWRITE"
      resolve_conflicts_on_update = "OVERWRITE"
    }
    aws-efs-csi-driver = {
      service_account_role_arn    = module.efs_csi_driver_irsa.arn
      addon_version               = "v2.3.0-eksbuild.1"
      resolve_conflicts_on_create = "OVERWRITE"
      resolve_conflicts_on_update = "OVERWRITE"
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
      instance_types = ["t3.small"]

      desired_size = 3
      min_size     = 1
      max_size     = 4

    }
  }

  enable_irsa = true

  tags = local.tags
}

data "aws_eks_cluster_auth" "main" {
  name = module.eks.cluster_name
}
