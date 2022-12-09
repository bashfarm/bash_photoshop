import LayerAIContext from 'models/LayerAIContext';
import { storage } from 'uxp';
import { ContextHistoryEnum } from '../constants';
import {
    getContextInfoFromFileName,
    getLatestContextHistoryFileInfo,
} from '../utils/context_utils';

import {
    getFileSerializer,
    getPluginDataFiles,
    saveLayerToPluginData,
} from './io_service';

import bashful from 'bashful';

/**
 * Create the next available historical file for the LayerContext
 * @param {LayerAIContext} layerContext
 * @param {string | Uint8Array} imgData
 */
export async function createNewContextHistoryFile(
    layerContext: LayerAIContext,
    imgData: string | Uint8Array
) {
    try {
        let serializer: bashful.io.Serializer = getFileSerializer(imgData);
        let fileName = await getNextAvailableHistoryFileName(layerContext);
        console.log(`Saving file with name ${fileName}`);
        if (!fileName) {
            alert('Please delete a file or use inplace image regeneration');
            return;
        }
        await serializer(fileName, imgData);
        return fileName;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Get only the href filepaths for the given context.  This is a relative path to the plugin data
 * where the history files are located.
 * @param {*} layerAIContext
 * @returns
 */
export async function getContextHisotryPluginFilePaths(
    layerAIContext: LayerAIContext
) {
    let historyFiles = await getContextHistoryFileEntries(layerAIContext);

    let paths = historyFiles.map((entry: storage.File) => {
        return entry.url.href;
    });

    if (!paths) paths = [];

    return paths;
}

/**
 * The file number can only go up to 5.  Only 5 files will be allowed for history
 * @param {Number} contextId
 * @param {Number} fileNumber
 * @returns
 */
export function createContextHistoryFileName(
    contextId: Number,
    fileNumber: Number
) {
    return `${ContextHistoryEnum.HISTORY_FILE_FLAG}_${contextId}_${fileNumber}.png`;
}

/**
 * Retreive the next available context history file name.
 * @param {LayerAIContext} layerContext
 */
export async function getNextAvailableHistoryFileName(
    layerContext: LayerAIContext,
    userFileLimit: Number = 5
) {
    let fileNumber = 0;
    let contextId = layerContext.id;

    let fileEntries = await getContextHistoryFileEntries(layerContext);

    let latestContextFileInfo = getLatestContextHistoryFileInfo(
        fileEntries.map((entry) => {
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
        return createContextHistoryFileName(contextId, fileNumber + 1);
    }
}

/**
 * Save the current layer context to the contexts historical files.  Return the new file name
 */
export async function saveLayerContexttoHistory(
    layerAIContext: LayerAIContext
) {
    try {
        let fileName = await getNextAvailableHistoryFileName(layerAIContext);
        console.log(`trying to save layer with file name ${fileName}`);
        if (!fileName) {
            return;
        }
        await saveLayerToPluginData(fileName, layerAIContext.layers[0]);
        return fileName;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Get the context's historical information.  Aka Images.  Hopefully we get more file entries for more
 * meta data soon.
 * @param {LayerAIContext} layerContext
 * @returns
 */
export async function getContextHistoryFileEntries(
    layerContext: LayerAIContext
) {
    try {
        return await getContextFileEntries(
            layerContext,
            ContextHistoryEnum.HISTORY_FILE_FLAG
        );
    } catch (e) {
        console.error(e);
    }
}

/**
 * This is meant to get all the files that have been created from the layerContext.  If you don't know what a Layer context is,
 * Check this documentation out
 * @param {Object} layerContext
 * @returns {Promise<Array>}
 */

export async function getContextFileEntries(
    layerContext: LayerAIContext,
    layerFileContextEnum: ContextHistoryEnum
) {
    try {
        let entries = await getPluginDataFiles();
        const theContextsFiles = entries.filter((entry) => {
            let contextInfo = getContextInfoFromFileName(entry.name);
            if (!contextInfo) {
                return false;
            }
            let { fileFlag, layerContextId } = contextInfo;

            return (
                entry.isFile &&
                fileFlag == layerFileContextEnum &&
                layerContext.id == layerContextId
            );
        });

        return theContextsFiles;
    } catch (e) {
        console.error(e);
    }
}
