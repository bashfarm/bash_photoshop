import { Layer } from 'photoshop/dom/Layer';
import { getContextFileEntries } from 'services/context_service';
import { getFileSerializer, saveLayerToPluginData } from 'services/io_service';
import {
    createContextHistoryFileName,
    getLatestContextHistoryFileInfo,
} from 'utils/context_utils';
import { storage } from 'uxp';
import LayerAIContextHistory from './LayerAIHistory';
import SmallDetailContext from './SmallDetailContext';
import bashful from 'bashful';
import { ContextHistoryEnum } from '../constants';
import { BashfulObject } from './BashfulObject';
import _, { uniqueId } from 'lodash';
import photoshop from 'photoshop';
import StyleReference from './StyleReference';
import { applyMask, duplicateLayer, hasMask } from 'services/layer_service';

export default class LayerAIContext extends BashfulObject {
    id: string; // this should be the id number of the layer
    name: string;
    smallDetails: Array<SmallDetailContext>; // The details from the above object
    currentPrompt: string;
    negativePrompt: string;
    docType: string;
    generationModelName: string;
    stylingStrength: number;
    consistencyStrength: number;
    imageHeight: number;
    imageWidth: number;
    batchSize: number;
    seed: number;
    shouldBeMasked: boolean;
    currentLayer: Layer; // the layer that the context is assigned to
    history: Array<LayerAIContextHistory>; // the hisory of the context
    styleReferences: Array<StyleReference>; // the hisory of the context
    prototype: any;

    constructor(
        currentLayer: Layer = null,
        name: string = null,
        smallDetails: Array<SmallDetailContext> = [],
        currentPrompt: string = '',
        history: Array<LayerAIContextHistory> = [],
        styleReferences: Array<StyleReference> = [],
        stylingStrength: number = 0.7,
        consistencyStrength: number = 0.85,
        imageHeight: number = 1024,
        imageWidth: number = 1024,
        seed: number = -1,
        negativePrompt: string = '',
        batchSize: number = 1,
        docType: string = 'illustration',
        generationModelName: string = 'model.ckpt',
        shouldBeMasked: boolean = true
    ) {
        super();
        this.name = name;
        this.id = this.createAILayerContextId();
        this.smallDetails = smallDetails;
        this.currentPrompt = currentPrompt;
        this.currentLayer = currentLayer;
        this.history = history;
        this.styleReferences = styleReferences;
        this.stylingStrength = stylingStrength;
        this.consistencyStrength = consistencyStrength;
        this.imageHeight = imageHeight;
        this.imageWidth = imageWidth;
        this.seed = seed;
        this.negativePrompt = negativePrompt;
        this.batchSize = batchSize;
        this.docType = docType;
        this.generationModelName = generationModelName;
        this.shouldBeMasked = shouldBeMasked;
    }

    public async hasLayerMask(): Promise<boolean> {
        return await hasMask(this.currentLayer);
    }

    public async canRegenerate(): Promise<boolean> {
        // return !(await this.hasLayerMask());
        return true;
    }

    public async applyLayerMask(): Promise<boolean> {
        if (await this.hasLayerMask()) {
            await applyMask(this.currentLayer);
            return true;
        }
        return false;
    }

    public async duplicateCurrentLayer(): Promise<Layer> {
        return await duplicateLayer(
            this.currentLayer,
            this.currentLayer,
            photoshop.constants.ElementPlacement.PLACEBEFORE
        );
    }

    /**
     * Return a copy of the context
     * @returns
     */
    public copy() {
        return _.cloneDeep(this);
    }

    /**
     * Retreive the next available context history file name.
     * @param {number} userFileLimit
     */
    public async getNextAvailableHistoryFileName(
        userFileLimit: number = 5,
        temp: boolean = false
    ) {
        if (temp) {
            return `${ContextHistoryEnum.TEMP_FILE_FLAG}_${this.id}_0.png`;
        }

        let fileNumber = 0;
        let fileEntries = await this.getContextHistoryFileEntries();

        let latestContextFileInfo = getLatestContextHistoryFileInfo(
            fileEntries.map((entry: storage.File) => {
                return entry.name;
            })
        );

        if (latestContextFileInfo) {
            // -1 will mean no limit on files.
            if (
                !(userFileLimit == -1) &&
                latestContextFileInfo.fileNumber >= userFileLimit
            ) {
                console.warn(
                    `We have run out of historical file storage for this user ${userFileLimit}, the user needs to delete a file or do inplace regneration`
                );
                return;
            }
            console.log(latestContextFileInfo);

            return createContextHistoryFileName(
                latestContextFileInfo.layerContextId,
                latestContextFileInfo.fileNumber + 1
            );
        } else {
            return createContextHistoryFileName(this.id, fileNumber + 1);
        }
    }

    /**
     */
    /**
     * Save the current layer context to the contexts historical files.  Return the new file name entry
     *
     * @param layerAIContext
     * @returns
     */
    public async saveLayerContexttoHistory(temp: boolean = false) {
        try {
            let fileName = await this.getNextAvailableHistoryFileName(-1, temp);
            console.log(`trying to save layer with file name ${fileName}`);
            if (!fileName) {
                return;
            }
            let historyImgEntry = await saveLayerToPluginData(
                fileName,
                this.currentLayer
            );
            return historyImgEntry;
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Get the context's historical information.  Aka Images.  Hopefully we get more file entries for more
     * meta data soon.
     * @returns
     */
    public async getContextHistoryFileEntries() {
        try {
            return (await getContextFileEntries(
                this,
                ContextHistoryEnum.HISTORY_FILE_FLAG
            )) as Array<storage.File>;
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Create the next available historical file for the LayerContext
     * @param {string | Uint8Array} imgData
     */
    public async createNewContextHistoryFile(
        imgData: string | Uint8Array,
        temp: boolean = false
    ) {
        try {
            let fileName = await this.getNextAvailableHistoryFileName(-1, temp);
            console.log(`Saving file with name ${fileName}`);
            if (!fileName) {
                alert('Please delete a file or use inplace image regeneration');
                return;
            }
            console.log(imgData);
            // Bad coding.  This should be a one liner and this should be like `serializeData()` or something
            // using getFileSerializer in it.
            let serializer: bashful.io.Serializer = getFileSerializer(imgData);
            await serializer(fileName, imgData);
            return fileName;
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Get only the href filepaths for the given context.  This is a relative path to the plugin data
     * where the history files are located.
     * @returns
     */
    public async getContextHistoryPluginFilePaths() {
        let historyFiles = await this.getContextHistoryFileEntries();

        let paths = historyFiles.map((entry: storage.File) => {
            return entry.url.href;
        });

        if (!paths) paths = [];

        return paths;
    }

    public hasActiveLayers() {
        const includesAny = (arr: Array<any>, values: any) =>
            values.some((v: any) => arr.includes(v));

        let docLayers = photoshop.app.activeDocument.layers;
        return includesAny([this.currentLayer], docLayers);
    }

    public createAILayerContextId() {
        return uniqueId();
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
}
