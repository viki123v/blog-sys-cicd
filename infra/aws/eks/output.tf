output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_ca" {
  value = module.eks.cluster_certificate_authority_data
}

output "eks_token" {
  value = data.aws_eks_cluster_auth.main.token
}

output "efs_fs_id" {
  value = resource.aws_efs_file_system.blogwalk-fs.id
}