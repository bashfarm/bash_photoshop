import { Layer } from 'photoshop/dom/Layer';
import {
    saveImgDataToDataFolder,
    saveLayerToPluginData,
} from 'services/io_service';

import _ from 'lodash';
import photoshop from 'photoshop';
import { applyMask, duplicateLayer, hasMask } from 'services/layer_service';
import ContextObject from './ContextObject';
import { createLayerFileName } from 'utils/general_utils';

export default class LayerAIContext extends ContextObject {
    name: string;
    generationModelName: string;
    currentLayerName: string; // the layer that the context is assigned to
    tempLayerName: string; // typically a duplicate of the current layer
    currentLayerId: number;
    tempLayerId: number;
    id: string;

    constructor(
        id: string,
        options: any = {
            currentLayerName: '',
            currentLayerId: '',
            tempLayerName: '',
            tempLayerId: '',
            name: null,
            generationModelName: '',
            docType: '',
            currentPrompt: '',
            imageHeight: 1024,
            imageWidth: 1024,
            consistencyStrength: 0.7,
            stylingStrength: 0.7,
            negativePrompt: '',
            model_config: '',
        }
    ) {
        super();
        this.id = id;
        this.name = options.name;
        this.currentLayerName =
            options.currentLayerName ?? this.currentLayerName;
        this.currentLayerId = options.currentLayerId ?? this.currentLayerId;
        this.tempLayerId = options.tempLayerId ?? this.tempLayerId;
        this.generationModelName =
            options.generationModelName ?? this.generationModelName;
        this.currentPrompt = options.currentPrompt ?? this.currentPrompt;
        this.imageHeight = options.imageHeight ?? this.imageHeight;
        this.imageWidth = options.imageHeight ?? this.imageHeight;
        this.consistencyStrength =
            options.consistencyStrength ?? this.consistencyStrength;
        this.stylingStrength = options.stylingStrength ?? this.stylingStrength;
        this.negativePrompt = options.negativePrompt ?? this.negativePrompt;
        this.model_config = options.model_config ?? this.model_config;
    }

    public get currentLayer(): Layer {
        return this.getPhotoshopLayerFromId(this.currentLayerId);
    }

    public get tempLayer(): Layer {
        return this.getPhotoshopLayerFromId(this.tempLayerId);
    }

    public set currentLayer(layer: Layer) {
        this.currentLayerId = layer?.id;
    }

    public set tempLayer(layer: Layer) {
        this.tempLayerId = layer?.id;
    }

    public getPhotoshopLayerFromName(layerName: string) {
        return photoshop.app.activeDocument?.layers?.filter(
            (layer) => layerName?.toLowerCase() == layer?.name?.toLowerCase()
        )[0];
    }

    public getPhotoshopLayerFromId(layerId: number) {
        return photoshop.app.activeDocument?.layers?.filter(
            (layer) => layerId == layer?.id
        )[0];
    }

    public async hasLayerMask(): Promise<boolean> {
        return await hasMask(this.currentLayer);
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
     * Save the current layer context to the contexts historical files.  Return the new file name entry
     *
     * @param layerAIContext
     * @returns
     */
    public async createTempImageFileOfLayer() {
        try {
            let fileName = createLayerFileName(
                this.currentLayer?.name ?? '',
                this.id,
                false
            );
            let tempImgEntry = await saveLayerToPluginData(
                fileName,
                this.currentLayer
            );
            return tempImgEntry;
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Create the next available historical file for the LayerContext
     * @param {string | Uint8Array} imgData
     */
    public async createTempGenFile(imgData: string | Uint8Array) {
        try {
            let fileName = createLayerFileName(
                `${this.currentLayer?.name.replace(' ', '_')}`,
                this.id,
                true
            );
            await saveImgDataToDataFolder(fileName, imgData);
            return fileName;
        } catch (e) {
            console.error(e);
        }
    }
}
