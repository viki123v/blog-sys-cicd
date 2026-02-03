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

resource "kubectl_manifest" "gh-namespace" {
  yaml_body = file("${local.manifests_root}/namespace.yaml")
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
