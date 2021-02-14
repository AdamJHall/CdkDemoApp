import {Construct, Stack, StackProps} from "@aws-cdk/core";
import * as ecsPatterns from "@aws-cdk/aws-ecs-patterns";
import {Vpc} from "@aws-cdk/aws-ec2";
import {Cluster, ContainerImage, FargateTaskDefinition, Protocol} from "@aws-cdk/aws-ecs";
import * as path from "path";

export class DataApi extends Stack {

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const vpc = new Vpc(this, "VPC", {
            maxAzs: 2
        });

        const cluster = new Cluster(this, "Cluster", {
            vpc: vpc
        });

        const taskDef = new FargateTaskDefinition(this, 'APITaskDefinition', {
            cpu: 1024,
            memoryLimitMiB: 512,
        });

        const applicationContainer = taskDef.addContainer(
            "app",
            {
                image: ContainerImage.fromAsset(
                    path.resolve(__dirname, '../data-api/'),
                    {
                        file: 'docker/php/Dockerfile'
                    }
                )
            }
        );

        applicationContainer.addPortMappings({
            hostPort: 3000,
            containerPort: 3000,
            protocol: Protocol.TCP
        })

        const proxyContainer = taskDef.addContainer(
            "nginx",
            {
                image: ContainerImage.fromAsset(
                    path.resolve(__dirname, '../data-api/'),
                    {
                        file: 'docker/nginx/Dockerfile'
                    }
                )
            }
        );

        proxyContainer.addPortMappings({
            hostPort: 80,
            containerPort: 80,
            protocol: Protocol.TCP
        });

        const loadBalancedFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(
            this,
            "ApiService",
            {
                cluster: cluster,
                cpu: 1024,
                memoryLimitMiB: 512,
                desiredCount: 1,
                taskDefinition: taskDef,
                assignPublicIp: true,
                listenerPort: 80,
            }
        );
    }
}