#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { EcrStack } from "../lib/ecr-stack";
import { EcsStack } from "../lib/ecs-stack";

const app = new cdk.App();
new EcsStack(app, "Bsky2chEcsStack", {
  env: {
    region: "ap-northeast-1",
  },
});
new EcrStack(app, "Bsky2chEcrStack", {
  env: {
    region: "ap-northeast-1",
  },
});
