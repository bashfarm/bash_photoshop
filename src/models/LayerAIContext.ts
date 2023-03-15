import { Layer } from 'photoshop/dom/Layer';
import { saveImgDataToDataFolder, saveLayerToPluginData } from 'services/io_service';

import _ from 'lodash';
import photoshop from 'photoshop';
import { applyMask, duplicateLayer, hasMask } from 'services/layer_service';
import ContextObject from './ContextObject';

export default class LayerAIContext extends ContextObject {
    name: string;
    generationModelName: string;
    currentLayer: Layer; // the layer that the context is assigned to
    tempLayer: Layer; // typically a duplicate of the current layer

    constructor(
        options: any = {
            currentLayer: null,
            name: null,
            generationModelName: 'model.ckpt',
            docType: '"illustration"',
            currentPrompt: '',
            imageHeight: 1024,
            imageWidth: 1024,
            consistencyStrength: 0.7,
            stylingStrength: 0.7,
            negativePrompt: '',
        }
    ) {
        super();
        this.name = options.name;
        this.currentLayer = options.currentLayer ?? this.currentLayer;
        this.generationModelName =
            options.generationModelName ?? this.generationModelName;
        this.currentPrompt = options.currentPrompt ?? this.currentPrompt;
        this.imageHeight = options.imageHeight ?? this.imageHeight;
        this.imageWidth = options.imageHeight ?? this.imageHeight;
        this.consistencyStrength =
            options.consistencyStrength ?? this.consistencyStrength;
        this.stylingStrength = options.stylingStrength ?? this.stylingStrength;
        this.negativePrompt = options.negativePrompt ?? this.negativePrompt;
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
	public async createTempFile() {
		try {
			let fileName = `temp_${this.currentLayer.name}`
			console.debug(`trying to save layer with file name ${fileName}`);
			let tempImgEntry = await saveLayerToPluginData(
				fileName,
				this.currentLayer
			);
			console.debug('Temp File Entry Created', tempImgEntry);
			return tempImgEntry;
		} catch (e) {
			console.error(e);
		}
	}

    /**
     * Create the next available historical file for the LayerContext
     * @param {string | Uint8Array} imgData
     */
    public async createTempGenFile(
        imgData: string | Uint8Array,
        temp: boolean = false
    ) {
        try {
            let fileName = `${this.currentLayer.name} (regenerated)`;
			await saveImgDataToDataFolder(fileName, imgData);
            return fileName;
        } catch (e) {
            console.error(e);
        }
    }

}
