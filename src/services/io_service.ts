import base64js from 'base64-js';
const photoshop = require('photoshop');
import { Layer } from 'photoshop/dom/Layer';
import { storage } from 'uxp';
import { unformatBase64Image } from '../utils/io_utils';
import {
    getVisibleLayers,
    makeLayersInvisible,
    makeLayersVisible,
} from './layer_service';

import { executeInPhotoshop } from './middleware/photoshop_middleware';

const [lfs, types, formats] = [
    storage.localFileSystem,
    storage.types,
    storage.formats,
];

/**
 * Save the given text to a file in the plugin data folder
 * @param {String} fileName
 * @param {*} data
 */
export async function saveTextFileToDataFolder(fileName: string, data: string) {
    try {
        const entry = await createDataFolderEntry(fileName);
        const res = (await entry) as storage.File;
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
export async function saveBinaryFileToDataFolder(
    fileName: string,
    data: Uint8Array
): Promise<void> {
    try {
        let entry = await createDataFolderEntry(fileName);
        let res = (await entry) as storage.File;
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
export async function saveB64ImageToBinaryFileToDataFolder(
    fileName: string,
    data: string
): Promise<void> {
    try {
        await saveBinaryFileToDataFolder(
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
 * @returns a data folder
 */
export async function createDataFolderEntry(fileName: string) {
    const dataFolder: storage.Folder = await lfs.getDataFolder();
    const entry = dataFolder.createEntry(fileName, {
        type: types.file,
        overwrite: true,
    });
    return entry as Promise<storage.File>;
}

/**
 * Retrieve the base64 string of the given filename that should be found in the plugin data folder
 * @param {String} fileName
 * @returns
 */
export async function getDataFolderImageBase64ImgStr(
    fileName: string
): Promise<string> {
    try {
        let imgEntry = await getDataFolderEntry(fileName);
        let binaryData = (await imgEntry.read({
            format: formats.binary,
        })) as ArrayBuffer;
        return base64js.fromByteArray(new Uint8Array(binaryData));
    } catch (e) {
        console.error(e);
        throw e;
    }
}

/**
 * Retrieve a file entry from the plugin's data folder.
 */
export async function getDataFolderEntry(fileName: string) {
    const dataFolder = await lfs.getDataFolder();
    return (await dataFolder.getEntry(fileName)) as storage.File;
}

/**
 * Save the active app document to the plugin data folder as the given name.
 * @param {String} fileName
 */
export async function saveDocumentToPluginData(
    fileName: string
): Promise<void> {
    try {
        let entry = await createDataFolderEntry(fileName);
        saveDocumentAsPNG(entry);
    } catch (e) {
        console.error(e);
    }
}

/**
 * Save the current document state as a PNG to the given file entry.
 */
export async function saveDocumentAsPNG(fileRef: storage.File) {
    await executeInPhotoshop(
        saveDocumentAsPNG,
        async () =>
            await photoshop.app.activeDocument.saveAs.png(
                fileRef,
                undefined,
                true
            )
    );
}

/**
 * This will save the given layer as the given file name.
 * @param {String} fileName the filename to save the layer as
 * @param {Layer} layer
 * @return
 */
export async function saveLayerToPluginData(fileName: string, layer: Layer) {
    if (!layer) {
        console.warn(
            `Tried to save an undefined layer in ${saveLayerToPluginData.name}`
        );
    }

    try {
        const visibleLayers: Layer[] = getVisibleLayers(
            photoshop.app.activeDocument.layers
        );
        const prevVisibility = layer.visible;
        await executeInPhotoshop(saveLayerToPluginData, async () => {
            // Make layers inivisible so we only export the document with the the selected layer
            await makeLayersInvisible(visibleLayers);

            // Cause we want only the layer that was passed to us to be visible when we export
            layer.visible = true;

            // so now we need to export the document
            // We can just save a layer :/.  Dunno how, so I just turn off layer visibility and export like that.
            await saveDocumentToPluginData(fileName);

            // make the given layers visible again
            makeLayersVisible(visibleLayers);

            // Set the layer back to what it was before
            layer.visible = prevVisibility;
        });

        return await getDataFolderEntry(fileName);
    } catch (e) {
        console.error(e);
    }
}

/**
 * Simple function that checks if the given data type is a string or not.  If it is a string then it returns the right
 * function to serialize the data.
 * @param {Uint8Array | string} imgData
 * @returns {bashful.io.Serializer}
 */
export function getFileSerializer(imgData: Uint8Array | string) {
    if (typeof imgData === 'string' || imgData instanceof String)
        return saveB64ImageToBinaryFileToDataFolder;
    else return saveBinaryFileToDataFolder;
}

/**
 * Retrieve an array of all the plugin data folders entries.
 * @returns {Promise<Array>} An array of file entries
 */
export async function getPluginDataFiles(): Promise<storage.Entry[]> {
    const dataFolder = await lfs.getDataFolder();
    return dataFolder.getEntries();
}
