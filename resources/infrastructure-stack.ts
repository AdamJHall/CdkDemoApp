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

export class InfrastructureStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.createPipeline('staging');
        // this.createPipeline('production', true);
    }

    /**
     * Create a cdk pipeline for a specific github branch
     * @param branch
     * @param manualApproval
     * @private
     */
    private createPipeline(branch: string, manualApproval = false) {
        const sourceArtifact = new codepipeline.Artifact();
        const cloudAssemblyArtifact = new codepipeline.Artifact();

        const pipeline = new CdkPipeline(this, branch + 'Pipeline', {
            // The pipeline name
            pipelineName: branch + 'Pipeline',
            cloudAssemblyArtifact,

            // Where the source can be found
            sourceAction: new codepipeline_actions.GitHubSourceAction({
                actionName: 'GitHub',
                output: sourceArtifact,
                oauthToken: SecretValue.secretsManager('/github.com/token'),
                owner: 'AdamJHall',
                repo: 'CdkDemoApp',
                branch: branch
            }),

            // How it will be built and synthesized
            synthAction: SimpleSynthAction.standardNpmSynth({
                sourceArtifact,
                cloudAssemblyArtifact,
            }),
        });

        const application = new InfrastructureStage(this, branch);
        const applicationStage = pipeline.addApplicationStage(application);

        if (manualApproval) {
            applicationStage.addManualApprovalAction();
        }
    }
}