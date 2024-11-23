import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

export class EcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPCの作成（パブリックサブネットのみ）
    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      // パブリックサブネットのみを作成
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
      natGateways: 0, // NATゲートウェイは不要
    });

    // ECRリポジトリ
    const repository = new ecr.Repository(this, "Repository", {
      repositoryName: "bsky-2ch",
      removalPolicy: cdk.RemovalPolicy.DESTROY, // スタック削除時にリポジトリも削除
    });

    // ECSクラスター
    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc,
      clusterName: "bsky-2ch-cluster",
    });

    // ECSサービス（ALB付き）
    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      "Service",
      {
        cluster,
        memoryLimitMiB: 512,
        cpu: 256,
        desiredCount: 1,
        taskImageOptions: {
          image: ecs.ContainerImage.fromEcrRepository(repository),
          containerPort: 3000,
          environment: {
            NODE_ENV: "production",
          },
        },
        publicLoadBalancer: true,
        assignPublicIp: true,
      }
    );

    // ヘルスチェックの設定
    service.targetGroup.configureHealthCheck({
      path: "/",
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      timeout: cdk.Duration.seconds(10),
      interval: cdk.Duration.seconds(15),
    });

    // 出力
    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: service.loadBalancer.loadBalancerDnsName,
      description: "ALBのDNS名",
    });

    new cdk.CfnOutput(this, "RepositoryURI", {
      value: repository.repositoryUri,
      description: "ECRリポジトリのURI",
    });
  }
}
