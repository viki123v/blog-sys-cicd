locals {
  cluster_name      = "cicd-project"
}

module "eks" {
  source             = "terraform-aws-modules/eks/aws"
  version            = "~> 21.0"
  name               = local.cluster_name
  kubernetes_version = "1.35.0"

  addons = {
    kube-proxy = {}
    vpc-cni = {
      before_compute = true
      addon_version  = "1.21.1-eksbuild.1"
    }
  }

  endpoint_public_access                   = true
  enable_cluster_creator_admin_permissions = true

  compute_config = {
    enabled = false
  }

  eks_managed_node_groups = {
    default = {
      ami_type       = "AL2023_x86_64_STANDARD"
      instance_types = ["t3.micro"]

      min_size     = 1 
      max_size     = 3
      desired_size = 2
    }
  }

  tags = {
    Terraform = "true"
    College   = "true"
    Course    = "cicd"
  }
}
