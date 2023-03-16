import base64js from 'base64-js';
import _ from 'lodash';
import photoshop from 'photoshop';
import { Layer } from 'photoshop/dom/Layer';
import { storage } from 'uxp';
import { removeB64Header } from '../utils/io_utils';
import {
    getVisibleLayers,
    makeLayersInvisible,
    makeLayersVisible,
} from './layer_service';

import { executeInPhotoshop } from './middleware/photoshop_middleware';
import { alert } from 'services/alert_service';

const [lfs, types, formats] = [
    storage.localFileSystem,
    storage.types,
    storage.formats,
];

/**
 * This function gets the base64 string from an image url.
 * @param imgUrl
 */
export async function getB64StringFromImageUrl(
    imgUrl: string
): Promise<string> {
    const response = await fetch(imgUrl);
    return base64js.fromByteArray(new Uint8Array(await response.arrayBuffer()));
}

/**
 * Save the given data to a file
 * @param {String} fileEntry
 * @param {string} data
 */
export async function saveTextFile(
    fileEntry: storage.File | Promise<storage.File>,
    data: string
) {
    try {
        const res = await fileEntry;
        res.write(data, { format: formats.utf8 });
    } catch (e) {
        console.error('Saving Text File', e);
    }
}

export async function createTempFileEntry(tempName: string) {
    try {
        const tempFolder: storage.Folder = await lfs.getTemporaryFolder();
        const entry = tempFolder.createEntry(tempName, {
            type: types.file,
            overwrite: true,
        }) as Promise<storage.File>;
        return entry;
    } catch (e) {
        console.error(e);
    }
}

export async function saveImgDataToDataFolder(
    fileName: string,
    imgData: Uint8Array | string
): Promise<storage.File> {
    try {
        let serializer: any = null;
        if (typeof imgData === 'string' || imgData instanceof String) {
            serializer = saveB64ImageToBinaryFileToDataFolder;
        } else {
            serializer = saveBinaryFileToDataFolder;
        }
        return await serializer(fileName, imgData);
    } catch (e) {
        console.error(e);
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
): Promise<storage.File> {
    try {
        return await saveBinaryFileToDataFolder(
            fileName,
            base64js.toByteArray(removeB64Header(data))
        );
    } catch (e) {
        console.debug(e);
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
): Promise<storage.File> {
    try {
        let entry = await createDataFolderEntry(fileName);
        let res = (await entry) as storage.File;
        res.write(data, { format: formats.binary });
        return res;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Create an entry for the plugin data folder.
 * @param {String} fileName
 * @returns a data folder
 */
export async function createDataFolderEntry(fileName: string) {
    try {
        const dataFolder: storage.Folder = await lfs.getDataFolder();
        const entry = dataFolder.createEntry(fileName, {
            type: types.file,
            overwrite: true,
        });
        return entry as Promise<storage.File>;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieve the base64 string of the given filename that should be found in the plugin data folder
 * @param {String} fileName
 * @returns
 */
export async function getBase64OfImgInPluginDataFolder(
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
        console.log('Saving document to plugin data folder', entry);
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
 * Save the current document state as a PSD to the given file entry.
 */
export async function saveActiveDocument(
    fileRef: storage.File | string | Promise<storage.File>
) {
    try {
        if (_.isString(fileRef)) {
            fileRef = await createTempFileEntry(fileRef);
        }

        await executeInPhotoshop(saveDocumentAsPNG, async () => {
            await photoshop.app.activeDocument.saveAs.psd(
                (await fileRef) as storage.File
            );
        });
    } catch (e) {
        console.error(e);
    }
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
        console.debug(
            `Saving layer ${layer.name} to plugin data folder`,
            layer
        );
        await executeInPhotoshop(saveLayerToPluginData, async () => {
            // Make layers inivisible so we only export the document with the the selected layer
            await makeLayersInvisible(visibleLayers);
            // alert(`made layers invisible`)

            // Cause we want only the layer that was passed to us to be visible when we export
            layer.visible = true;
            // alert(`made single Layer visible`)

            // so now we need to export the document
            // We can't just save a layer :/.  Dunno how, so I just turn off layer visibility and export like that.
            await saveDocumentToPluginData(fileName);
            // alert(`saved document`)

            // make the given layers visible again
            await makeLayersVisible(visibleLayers);
            // alert(`made previous layers visible`)

            // Set the layer back to what it was before
            layer.visible = prevVisibility;
            // alert(`set our original layer back to visible`)
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

/**
 *
 * @param fileName
 * @returns
 */
export async function getTempFileEntry(fileName: string) {
    const tempFolder = await lfs.getTemporaryFolder();
    return (await tempFolder.getEntry(fileName)) as storage.File;
}
