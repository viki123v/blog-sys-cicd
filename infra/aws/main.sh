#!/bin/bash

eksctl create iamserviceaccount \
        --name ebs-csi-controller-sa \
        --namespace kube-system \
        --cluster cicd-project \
        --role-name AmazonEKS_EBS_CSI_DriverRole \
        --role-only \
        --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
        --approve

eksctl create addon --cluster cicd-project --name aws-ebs-csi-driver --version v1.55.0-eksbuild.1 \
    --service-account-role-arn arn:aws:iam::491203819554:role/AmazonEKS_EBS_CSI_DriverRole --force