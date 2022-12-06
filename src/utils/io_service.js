/**
 * So for the contexts files.  We probably want them to just have History, Merged, and Generated files.  Not sure how all these play together
 * just yet, but lets try it out.
 *
 * We will only allow for up to 5 files of history, history is for bashing and regeneration purposes
 */
const lfs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const types = require('uxp').storage.types;
const formats = require('uxp').storage.formats;
const executeAsModal = photoshop.core.executeAsModal;
const base64js = require('base64-js');
import { ContextHistoryEnums } from '../constants';
import { UnformatBase64Image } from './ai_service';
import { GetVisibleLayers } from './layer_service';
var b64ImgHeader = 'data:image/png;base64, ';

export async function SaveTextFileToDataFolder(fileName, data) {
    const dataFolder = await lfs.getDataFolder();
    try {
        let entry = dataFolder.createEntry(fileName, {
            type: types.file,
            overwrite: true,
        });
        var res = await entry;

        res.write(data, { format: formats.utf8 });
        console.log('saved base64 data in plugin folder');
    } catch (e) {
        console.log('something not write');
        console.log(e);
    }
}

export async function SaveBinaryFileToDataFolder(fileName, data) {
    const dataFolder = await lfs.getDataFolder();
    try {
        let entry = dataFolder.createEntry(fileName, {
            type: types.file,
            overwrite: true,
        });
        var res = await entry;
        res.write(data, { format: formats.binary });
        console.log('saved binary data to image in plugin folder');
    } catch (e) {
        console.log('something not write');
        console.log(e);
    }
}

export async function SaveB64ImageToBinaryFileToDataFolder(fileName, data) {
    try {
        console.log(UnformatBase64Image(data));
        data = base64js.toByteArray(UnformatBase64Image(data));
        console.log('converting with base64-js');
        return await SaveBinaryFileToDataFolder(fileName, data);
    } catch (e) {
        console.log(e);
    }
}

/**
 * BROKEN NOT WORKING
 * @param {String} base64Data
 * @returns
 */
export function IsBase64Str(base64Data) {
    // Not a good test
    return base64Data.length > 200;
}

export async function GetDataFolderImageBase64ImgStr(fileName) {
    const dataFolder = await lfs.getDataFolder();
    var placedDocument = await dataFolder.getEntry(fileName);
    var binaryData = await placedDocument.read({ format: formats.binary });
    try {
        const base64String = base64js.fromByteArray(new Uint8Array(binaryData));
        console.log('executing base64');
        return { imageHeader: b64ImgHeader, base64Data: base64String };
    } catch (e) {
        console.log(e);
    }
}

export async function SaveDocumentToPluginData(fileName) {
    const dataFolder = await lfs.getDataFolder();
    try {
        let entry = dataFolder.createEntry(fileName, {
            type: types.file,
            overwrite: true,
        });
        var fileRef = await entry;
        console.log(fileRef.nativePath.replace('\\\\', '\\'));
        await executeAsModal(async () => {
            await photoshop.app.activeDocument.saveAs.png(
                fileRef,
                { quality: 12 },
                true
            );
        });

        console.log(
            'Saved Document as PNG binary data to image in plugin folder'
        );
    } catch (e) {
        console.log('something not write');
        console.log(e);
    }
}

export async function SaveLayerToPluginData(fileName, layer) {
    const dataFolder = await lfs.getDataFolder();
    try {
        let visibleLayers = GetVisibleLayers();
        let prevVisibility = layer.visible;

        let entry = dataFolder.createEntry(fileName, {
            type: types.file,
            overwrite: true,
        });

        let fileRef = await entry;

        console.log(fileRef.nativePath.replace('\\\\', '\\'));

        await executeAsModal(async () => {
            // Make layers inivisible so we only export the document with the the selected layer
            visibleLayers.forEach((layer) => {
                layer.visible = false;
            });

            // Cause we want only the layer that was passed to us to be visible when we export
            layer.visible = true;

            // so now we need to export the document
            await photoshop.app.activeDocument.saveAs.png(
                fileRef,
                { quality: 12 },
                true
            );

            // lets turn back on the layers that were visible before
            visibleLayers.forEach((layer) => {
                layer.visible = false;
            });

            // Set the layer back to what it was before
            layer.visible = prevVisibility;
        });

        console.log(
            'Saved Document as PNG binary data to image in plugin folder'
        );
    } catch (e) {
        console.log('something not write');
        console.log(e);
    }
}

/**
 * This is meant to get all the files that have been created from the layerContext.  If you don't know what a Layer context is,
 * Check this documentation out
 * @param {Object} layerContext
 * @returns {Promise<Array>}
 */
export async function GetContextFileEntries(
    layerContext,
    layerFileContextEnum
) {
    try {
        const dataFolder = await lfs.getDataFolder();
        const entries = await dataFolder.getEntries();
        const theContextsFiles = entries.filter(
            (entry) =>
                entry.isFile &&
                entry.name.includes(layerContext.id) &&
                entry.name.includes(layerFileContextEnum)
        );

        console.log(theContextsFiles);
        return theContextsFiles;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Get the context's historical information.  Aka Images.  Hopefully we get more file entries for more
 * meta data soon.
 * @param {*} layerContext
 * @returns
 */
export async function GetContextHistoryFileEntries(layerContext) {
    try {
        return await GetContextFileEntries(
            layerContext,
            ContextHistoryEnums.HISTORY_FILE_FLAG
        );
    } catch (e) {
        console.error(e);
    }
}

/**
 * Get the context's Merged information.  Aka Images.  Hopefully we get more file entries for more
 * meta data soon.
 * @param {*} layerContext
 * @returns
 */
export async function GetContextMergedFileEntries(layerContext) {
    try {
        return await GetContextFileEntries(
            layerContext,
            ContextHistoryEnums.MERGED_FILE_FLAG
        );
    } catch (e) {
        console.error(e);
    }
}

/**
 * Get the context's Generated information.  Aka Images.  Hopefully we get more file entries for more
 * meta data soon.
 * @param {*} layerContext
 * @returns
 */
export async function GetContextGeneratedFileEntries(layerContext) {
    try {
        return await GetContextFileEntries(
            layerContext,
            ContextHistoryEnums.GENERATED_FILE_FLAG
        );
    } catch (e) {
        console.error(e);
    }
}

/**
 * Create the next available historical file for the LayerContext
 * @param {*} layerContext
 * @param {*} imgData
 */
export async function CreateHistoryFile(layerContext, imgData) {
    try {
        let fp = GetFileProvider(imgData);
        let fileName = GetNextAvailableHistoryFileName(layerContext);
        if (!fileName) {
            alert('Please delete a file or use inplace image regeneration');
        }
        await fp(fileName, imgData);
    } catch (e) {
        console.error(e);
    }
}

/**
 * There are only 5 history files available
 * @param {*} layerContext
 */
export async function GetNextAvailableHistoryFileName(layerContext) {
    let historyFiles = await GetContextHistoryFileEntries(layerContext);
    let latestFileNumber = GetLatestFileNumber(historyFiles);

    if (latestFileNumber == 5) {
        console.log(
            'We have run out of historical file storage, the user needs to delete a file or do inplace regneration'
        );
        return;
    }
    let fileName = CreateContextHistoryFileName(layerContext, latestFileNumber);

    console.log(`Latest availabel historical file is ${fileName}`);
    return fileName;
}

function GetFileProvider(imgData) {
    if (typeof imgData === 'string' || imgData instanceof String)
        return SaveB64ImageToBinaryFileToDataFolder;
    else return SaveBinaryFileToDataFolder;
}

/**
 * The file number can only go up to 5.  Only 5 files will be allowed for history
 * @param {*} layerAIContext
 * @param {*} fileNumber
 * @returns
 */
export function CreateContextHistoryFileName(layerAIContext, fileNumber) {
    return `${ContextHistoryEnums.HISTORY_FILE_FLAG}_${layerAIContext.id}_${fileNumber}.png`;
}

/**
 * Most likely just going to be a place holder for when we are merging thing sot be sent of for variation.
 */
export function CreateContextMergedFileName(layerAIContext, fileNumber) {
    return `${ContextHistoryEnums.MERGED_FILE_FLAG}_${layerAIContext.id}_${fileNumber}.png`;
}

/**
 * Create the geenrated file name
 * @param {*} layerAIContext
 * @param {*} fileNumber
 * @returns
 */
export function CreateContextGeneratedFileName(layerAIContext, fileNumber) {
    return `${ContextHistoryEnums.GENERATED_FILE_FLAG}_${layerAIContext.id}_${fileNumber}.png`;
}

export function GetLatestFileNumber(fileEntries) {
    console.log(fileEntries);

    let fileNumber = Math.max(
        fileEntries.map((file) => parseInt(file.name.split('_').slice(-1)[0]))
    );
    console.log(fileNumber);
    if (!fileNumber) {
        return 1;
    }
}

export async function GetLatestHistoryFileName(layerAIContext) {
    let historyFiles = await GetContextHistoryFileEntries(layerAIContext);
    let latestFileNumber = GetLatestFileNumber(historyFiles);
    return CreateContextHistoryFileName(layerAIContext, latestFileNumber);
}

export async function GetHistoryFilePaths(layerAIContext) {
    let historyFiles = await GetContextHistoryFileEntries(layerAIContext);
    return historyFiles.map((entry) => entry.nativePath.replace('\\\\', '\\'));
}
