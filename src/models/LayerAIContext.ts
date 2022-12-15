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

export default class LayerAIContext extends BashfulObject {
    id: string; // this should be the id number of the layer
    smallDetails: Array<SmallDetailContext>; // The details from the above object
    currentPrompt: string;
    currentLayer: Layer; // the layer that the context is assigned to
    history: Array<LayerAIContextHistory>; // the hisory of the context

    constructor(
        currentLayer: Layer = null,
        smallDetails: Array<SmallDetailContext> = [],
        currentPrompt: string = '',
        history: Array<LayerAIContextHistory> = []
    ) {
        super();
        this.id = this.createAILayerContextId();
        this.smallDetails = smallDetails;
        this.currentPrompt = currentPrompt;
        this.currentLayer = currentLayer;
        this.history = history;
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
    public async getNextAvailableHistoryFileName(userFileLimit: number = 5) {
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
    public async saveLayerContexttoHistory() {
        try {
            let fileName = await this.getNextAvailableHistoryFileName(-1);
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
    public async createNewContextHistoryFile(imgData: string | Uint8Array) {
        try {
            let fileName = await this.getNextAvailableHistoryFileName(-1);
            console.log(`Saving file with name ${fileName}`);
            if (!fileName) {
                alert('Please delete a file or use inplace image regeneration');
                return;
            }
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
}
