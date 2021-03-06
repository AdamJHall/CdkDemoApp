import {Construct, Stage, Stack, StackProps, SecretValue, StageProps} from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import {CdkPipeline, SimpleSynthAction} from "@aws-cdk/pipelines";
import {DataApi} from "../backend/resources";

export class InfrastructureStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new DataApi(this, 'DataApi', {});
    }
}

export interface InfrastructureStackProps extends StackProps {
    owner: string,
    repo: string,
    branch?: string,
    manualApprovals?: boolean
}

export class InfrastructureStack extends Stack {
    constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
        super(scope, id, props);

        const sourceArtifact = new codepipeline.Artifact();
        const cloudAssemblyArtifact = new codepipeline.Artifact();
        const branch = props.branch ?? 'main';

        const pipeline = new CdkPipeline(this, 'Pipeline', {
            pipelineName: branch + 'Pipeline',
            cloudAssemblyArtifact,
            sourceAction: new codepipeline_actions.GitHubSourceAction({
                actionName: 'GitHub',
                output: sourceArtifact,
                oauthToken: SecretValue.secretsManager('/github.com/token'),
                owner: props.owner,
                repo: props.repo,
                branch
            }),
            synthAction: SimpleSynthAction.standardNpmSynth({
                sourceArtifact,
                cloudAssemblyArtifact,
                synthCommand: 'npx cdk synth ' + id
            }),
        });

        const application = new InfrastructureStage(this, branch);
        const applicationStage = pipeline.addApplicationStage(
            application,
            {
                    manualApprovals: props.manualApprovals ?? false
            }
        );
    }
}