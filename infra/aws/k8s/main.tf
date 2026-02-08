terraform {
  required_providers {
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.7.0"
    }
  }
}

locals {
  manifests_root = "${path.module}/../../deployments"
}

data "kubectl_file_documents" "rbac-db" {
  content = file("${local.manifests_root}/db/rbac.yaml")
}

resource "kubectl_manifest" "ebs-storageclass" {
  yaml_body = file("${local.manifests_root}/remote_storage/ebs.yaml")
}

resource "kubectl_manifest" "efs-storageclass" {
  yaml_body = file("${local.manifests_root}/remote_storage/efs.yaml")
}

resource "kubectl_manifest" "gh-namespace" {
  yaml_body = file("${local.manifests_root}/namespace.yaml")
  depends_on = [ 
     kubectl_manifest.ebs-storageclass,
     kubectl_manifest.efs-storageclass
  ]
}

resource "kubectl_manifest" "gh_secret" {
  yaml_body  = file("${local.manifests_root}/gh-secret.yaml")
  depends_on = [
    kubectl_manifest.gh-namespace,
  ]
}

resource "kubectl_manifest" "rbac-db" {
  for_each   = data.kubectl_file_documents.rbac-db.manifests
  yaml_body  = each.value
  depends_on = [
   kubectl_manifest.gh-namespace
  ]
}

resource "kubectl_manifest" "opreator-config" {
  yaml_body  = file("${local.manifests_root}/db/operator-config.yml")
  depends_on = [
    kubectl_manifest.rbac-db,
    kubectl_manifest.gh-namespace
  ]
}

resource "kubectl_manifest" "operator" {
  yaml_body = file("${local.manifests_root}/db/operator.yaml")
  depends_on = [
    kubectl_manifest.rbac-db,
    kubectl_manifest.opreator-config,
    kubectl_manifest.gh-namespace,
  ]
}

resource "kubectl_manifest" "operator-service" {
  yaml_body = file("${local.manifests_root}/db/operator-service.yaml")
  depends_on = [
    kubectl_manifest.operator,
    kubectl_manifest.gh-namespace
  ]
}

resource "kubectl_manifest" "app-db" {
  yaml_body = file("${local.manifests_root}/db/app.yaml")
  depends_on = [
    kubectl_manifest.operator,
    kubectl_manifest.gh-namespace
  ]
}

resource "kubectl_manifest" "init-sql-config" {
  yaml_body  = file("${local.manifests_root}/db/init-sql-config.yaml")
  depends_on = [
    kubectl_manifest.app-db,
  ]
}

resource "kubectl_manifest" "init-db" {
  yaml_body = file("${local.manifests_root}/db/init-db.yaml")
  depends_on = [
    kubectl_manifest.init-sql-config,
  ]
}

resource "kubectl_manifest" "be-secrets" {
  yaml_body = file("${local.manifests_root}/be/secrets.yaml")
  depends_on = [
    kubectl_manifest.init-db
   ]
}

resource "kubectl_manifest" "be-pvc" {
  yaml_body = file("${local.manifests_root}/be/storage/prod/pv-claim.yaml")
  depends_on = [
    kubectl_manifest.init-db
   ]
}

resource "kubectl_manifest" "be-app" {
  yaml_body = file("${local.manifests_root}/be/app.yaml")
  depends_on = [
    kubectl_manifest.be-secrets
   ]
}

resource "kubectl_manifest" "be-service" {
  yaml_body = file("${local.manifests_root}/be/prod/service.yaml")
  depends_on = [
    kubectl_manifest.be-app
   ]
}

#The url from be-service must be added as a VITE_HOST in the frontend 
resource "kubectl_manifest" "fe-app" {
  yaml_body = file("${local.manifests_root}/fe/app.yaml")
  depends_on = [
    kubectl_manifest.be-service
   ]
}

resource "kubectl_manifest" "fe-service" {
  yaml_body = file("${local.manifests_root}/fe/prod/service.yaml")
  depends_on = [
    kubectl_manifest.be-service
   ]
}