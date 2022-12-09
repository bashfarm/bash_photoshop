const lfs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const types = require('uxp').storage.types;
const formats = require('uxp').storage.formats;
const base64js = require('base64-js');
import { unformatBase64Image } from '../utils/io_utils';
import {
    getVisibleLayers,
    makeLayersInvisible,
    makeLayersVisible,
} from './layer_service';

import { executeInPhotoshop } from './middleware/photoshop_middleware';

/**
 * Save the given text to a file in the plugin data folder
 * @param {String} fileName
 * @param {*} data
 */
export async function saveTextFileToDataFolder(fileName, data) {
    try {
        let entry = await createDataFolderEntry(fileName);
        let res = await entry;

        res.write(data, { format: formats.utf8 });
    } catch (e) {
        console.log('something not write');
        console.log(e);
    }
}

/**
 * Save the give data as binary to a file in the plugin data folder
 * @param {String} fileName
 * @param {*} data
 */
export async function saveBinaryFileToDataFolder(fileName, data) {
    try {
        let entry = await createDataFolderEntry(fileName);
        let res = await entry;
        res.write(data, { format: formats.binary });
    } catch (e) {
        console.log('something not write');
        console.log(e);
    }
}

/**
 * Given a base64 image string, save it as binary in the plugin data folder.
 * @param {String} fileName
 * @param {String} data
 * @returns
 */
export async function saveB64ImageToBinaryFileToDataFolder(fileName, data) {
    try {
        return await saveBinaryFileToDataFolder(
            fileName,
            base64js.toByteArray(unformatBase64Image(data))
        );
    } catch (e) {
        console.log(e);
    }
}

/**
 * Create an entry for the plugin data folder.
 * @param {String} fileName
 * @returns
 */
export async function createDataFolderEntry(fileName) {
    const dataFolder = await lfs.getDataFolder();
    let entry = dataFolder.createEntry(fileName, {
        type: types.file,
        overwrite: true,
    });
    return entry;
}

/**
 * Retrieve the base64 string of the given filename that should be found in the plugin data folder
 * @param {String} fileName
 * @returns
 */
export async function getDataFolderImageBase64ImgStr(fileName) {
    try {
        let imgEntry = await getDataFolderEntry(fileName);
        let binaryData = await imgEntry.read({ format: formats.binary });
        return base64js.fromByteArray(new Uint8Array(binaryData));
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieve a file entry from the plugin's data folder.
 */
export async function getDataFolderEntry(fileName) {
    const dataFolder = await lfs.getDataFolder();
    return await dataFolder.getEntry(fileName);
}

/**
 * Save the active app document to the plugin data folder as the given name.
 * @param {String} fileName
 */
export async function saveDocumentToPluginData(fileName) {
    try {
        saveDocumentAsPNG(await createDataFolderEntry(fileName));
    } catch (e) {
        console.error(e);
    }
}

/**
 * Save the current document state as a PNG to the given file entry.
 */
export async function saveDocumentAsPNG(fileRef) {
    executeInPhotoshop(
        async () =>
            await photoshop.app.activeDocument.saveAs.png(
                fileRef,
                { quality: 12 },
                true
            )
    );
}

/**
 * This will save the given layer as the given file name.
 * @param {String} fileName the filename to save the layer as
 * @param {*} layer
 */
export async function saveLayerToPluginData(fileName, layer) {
    try {
        let visibleLayers = getVisibleLayers(
            photoshop.app.activeDocument.layers
        );
        console.log(visibleLayers);
        let prevVisibility = layer.visible;

        await executeInPhotoshop(async () => {
            // Make layers inivisible so we only export the document with the the selected layer
            await makeLayersInvisible(visibleLayers);
            console.log('made layers invisible');

            // Cause we want only the layer that was passed to us to be visible when we export
            layer.visible = true;

            // so now we need to export the document
            // We can just save a layer :/.  Dunno how, so I just turn off layer visibility and export like that.
            await saveDocumentToPluginData(fileName);
            console.log('saved document');

            // make the given layers visible again
            makeLayersVisible(visibleLayers);

            // Set the layer back to what it was before
            layer.visible = prevVisibility;
        });
    } catch (e) {
        console.error(e);
    }
}

/**
 * Simple function that checks if the given data type is a string or not.  If it is a string then it returns the right
 * function to serialize the data.
 * @param {*} imgData
 * @returns
 */
export function getFileSerializer(imgData) {
    if (typeof imgData === 'string' || imgData instanceof String)
        return saveB64ImageToBinaryFileToDataFolder;
    else return saveBinaryFileToDataFolder;
}

/**
 * Retrieve an array of all the plugin data folders entries.
 * @returns {Promise<Array>} An array of file entries
 */
export async function getPluginDataFiles() {
    const dataFolder = await lfs.getDataFolder();
    return await dataFolder.getEntries();
}
