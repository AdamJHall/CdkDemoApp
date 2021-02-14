import {Construct, Stack, StackProps} from "@aws-cdk/core";
import * as ecsPatterns from "@aws-cdk/aws-ecs-patterns";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as path from "path";

export class DataApi extends Stack {

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, "VPC", {
            maxAzs: 2
        });

        const cluster = new ecs.Cluster(this, "Cluster", {
            vpc: vpc
        });

        const taskDef = new ecs.FargateTaskDefinition(this, 'APITaskDefinition', {
            cpu: 1024,
            memoryLimitMiB: 512,
        });

        const applicationContainer = taskDef.addContainer(
            "app",
            {
                image: ecs.ContainerImage.fromAsset(
                    path.resolve(__dirname, '../data-api/'),
                    {
                        file: 'docker/php/Dockerfile'
                    }
                )
            }
        );

        const proxyContainer = taskDef.addContainer(
            "nginx",
            {
                image: ecs.ContainerImage.fromAsset(
                    path.resolve(__dirname, '../data-api/'),
                    {
                        file: 'docker/nginx/Dockerfile'
                    }
                )
            }
        );

        // Link the application container so it can proxy requests
        proxyContainer.addLink(applicationContainer);
        proxyContainer.addPortMappings({
            hostPort: 80,
            containerPort: 80
        });

        const loadBalancedFargateService = new ecsPatterns.ApplicationMultipleTargetGroupsFargateService(
            this,
            "ApiService",
            {
                cluster: cluster,
                cpu: 1024,
                memoryLimitMiB: 512,
                desiredCount: 1,
                taskDefinition: taskDef,
            }
        );
    }
}