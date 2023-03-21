import { BashfulObject } from './BashfulObject';
import _ from 'lodash';

export default class ContextObject extends BashfulObject {
    id: string; // this should be the id number of the layer
    docType: string;
    currentPrompt: string;
    negativePrompt: string;
    stylingStrength: number;
    consistencyStrength: number;
    imageHeight: number;
    imageWidth: number;
    batchSize: number;
    seed: number;
    model_config: string;
    is_cloud_run: boolean;
    isGenerating: boolean;

    constructor(
        options: any = {
            currentPrompt: '',
            stylingStrength: 0.7,
            consistencyStrength: 0.0,
            seed: -1,
            negativePrompt: '',
            docType: '',
            batchSize: 1,
            imageHeight: 1024,
            imageWidth: 1024,
            tags: {},
            model_config: 'OpenJourney-Config',
            is_cloud_run: true,
            isGenerating: false,
        }
    ) {
        super();
        this.id = this.createID();
        this.currentPrompt = options.currentPrompt;
        this.stylingStrength = options.stylingStrength;
        this.consistencyStrength = options.consistencyStrength;
        this.seed = options.seed;
        this.negativePrompt = options.negativePrompt;
        this.docType = options.docType;
        this.batchSize = options.batchSize;
        this.imageHeight = options.imageHeight;
        this.imageWidth = options.imageWidth;
        this.model_config = options.model_config;
        this.is_cloud_run = options.is_cloud_run;
        this.isGenerating = options.isGenerating;
    }

    public getStylingStrength() {
        return 20 * this.stylingStrength;
    }

    /**
     * The consistency strength is just the amount of denoising will occur.  30 is the max amount of noise in the API.  So we are letting the user
     * set the percentage of noise they want to have.  The higher the number the more noise, it is confusing so we are inversing that for the user and calling it
     * `consistency strength`.  So for the most noise, we will set the consistency strength to 0. for the least noise, we will set the consistency strength to 1.
     * @returns
     */
    public getDenoisingStrength() {
        return 1 - this.consistencyStrength;
    }
}
