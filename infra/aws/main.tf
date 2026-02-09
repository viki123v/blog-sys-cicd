
module "eks" {
  source       = "./eks"
  cluster_name = "cicd-project1"
}

provider "kubectl" {
  host                   = module.eks.eks_cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.eks_ca)
  token                  = module.eks.eks_token
  load_config_file       = false
}

module "k8s" {
  source = "./k8s"
  cluster_name = module.eks.eks_cluster_name
  cluster_endpoint = module.eks.eks_cluster_endpoint
  certificate = module.eks.eks_ca
  token = module.eks.eks_token
}