import { BashfulObject } from './BashfulObject';
import _ from 'lodash';
import StyleReference from './StyleReference';
import ContextTag from './ContextTag';

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
    styleReferences: Array<StyleReference>;
    tags: Record<string, ContextTag>;
    model_config: string;
    is_cloud_run: true;
    isGenerating: false;

    constructor(
        options: any = {
            currentPrompt: '',
            stylingStrength: 0.7,
            consistencyStrength: 0.0,
            seed: -1,
            negativePrompt: '',
            docType: 'illustration',
            batchSize: 1,
            imageHeight: 1024,
            imageWidth: 1024,
            styleReferences: [],
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
        this.styleReferences = options.styleReferences;
        this.imageHeight = options.imageHeight;
        this.imageWidth = options.imageWidth;
        this.tags = options.tags;
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

    public removeTag(tag: ContextTag) {
        this.tags = _.omit(this.tags, tag.id);
    }

    public addTag(tag: ContextTag) {
        if (this.tagExists(tag.text)) {
            tag.update(tag);
        }

        this.tags[tag.id] = tag;
    }

    public tagExists(tagName: string) {
        return Object.values(this.tags).find(
            (t) => t.text?.toLowerCase() === tagName?.toLowerCase()
        );
    }

    public removeStyleReference(styleReference: StyleReference) {
        this.styleReferences = this.styleReferences.filter(
            (sr) => sr.id !== styleReference.id
        );
        return this.styleReferences;
    }

    public addStyleReference(styleReference: StyleReference) {
        this.styleReferences.push(styleReference);
        return this.styleReferences;
    }

    public getStyleReference(id: string) {
        return this.styleReferences.find((sr) => sr.id === id);
    }

    public getTag(tagID: string) {
        return this.tags[tagID];
    }

    public getTags() {
        return this.tags;
    }

    public getStyleReferences() {
        return this.styleReferences;
    }

    public getStyleReferenceCount() {
        return this.styleReferences.length;
    }

    public generateContextualizedPrompt() {
        let prompt: string = this.currentPrompt;
        let categories: Array<string> = [];
        let moods: Array<string> = [];
        let artists: Array<string> = [];

        for (let styleRef of this.styleReferences) {
            categories = [...categories, ...styleRef.categories];
            moods = [...moods, ...styleRef.moods];
            artists = [...artists, ...styleRef.artists];
        }

        if (categories.length > 0) {
            prompt += ` With styles like ${categories.join(', and ')}.`;
        }
        if (moods.length > 0) {
            prompt += ` With moods like ${moods.join(', and ')}.`;
        }
        if (artists.length > 0) {
            prompt += ` By the artists ${artists.join(', and ')}.`;
        }
        return prompt;
    }

    public generateContextualizedNegativePrompt() {
        let negativePrompt: string = this.negativePrompt;

        for (let tag of Object.values(this.tags)) {
            negativePrompt += ` ${tag.getContextualizedText()}`;
        }

        return negativePrompt;
    }
}
