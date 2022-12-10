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

export default class LayerAIContext {
    id: Number; // this should be the id number of the layer
    smallDetails: Array<SmallDetailContext>; // The details from the above object
    currentPrompt: string;
    layers: Array<Layer>; // the layers that belong to the context
    history: Array<LayerAIContextHistory>; // the hisory of the context

    constructor(
        layer: Layer,
        smallDetails: Array<SmallDetailContext> = [],
        currentPrompt: string = '',
        layers: Array<Layer> = [],
        history: Array<LayerAIContextHistory> = []
    ) {
        this.id = LayerAIContext.createAILayerContextId(layer);
        this.smallDetails = smallDetails;
        this.currentPrompt = currentPrompt;
        this.layers = [layer, ...layers];
        this.history = history;
    }

    static createAILayerContextId(layer: Layer) {
        return parseInt(`${layer.id}${layer.document.id}`);
    }

    /**
     * Retreive the next available context history file name.
     * @param {LayerAIContext} layerContext
     */
    public async getNextAvailableHistoryFileName(userFileLimit: Number = 5) {
        let fileNumber = 0;
        let fileEntries = await this.getContextHistoryFileEntries();

        let latestContextFileInfo = getLatestContextHistoryFileInfo(
            fileEntries.map((entry: storage.File) => {
                return entry.name;
            })
        );

        if (latestContextFileInfo) {
            if (latestContextFileInfo.fileNumber >= userFileLimit) {
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
    public async saveLayerContexttoHistory() {
        try {
            let fileName = await this.getNextAvailableHistoryFileName();
            console.log(`trying to save layer with file name ${fileName}`);
            if (!fileName) {
                return;
            }
            let historyImgEntry = await saveLayerToPluginData(
                fileName,
                this.layers[0]
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
    public async createNewContextHistoryFile(imgData: string | Uint8Array) {
        try {
            let fileName = await this.getNextAvailableHistoryFileName();
            console.log(`Saving file with name ${fileName}`);
            if (!fileName) {
                alert('Please delete a file or use inplace image regeneration');
                return;
            }
            // Bad coding.  This should be a one liner and this should be like `serializeData()` or something
            // using getFileSerializer in it.
            let serializer: bashful.io.Serializer = getFileSerializer(imgData);
            serializer(fileName, imgData);
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
}
