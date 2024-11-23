#!/bin/bash

# リージョンとアカウントIDを設定
AWS_REGION="ap-northeast-1"  # 東京リージョンの場合
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY="bsky-2ch"  # ECRリポジトリ名

# ECRレジストリにログイン
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# イメージをビルド
docker build -t ${ECR_REPOSITORY} .

# イメージにタグを付ける
docker tag ${ECR_REPOSITORY}:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest

# イメージをプッシュ
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
