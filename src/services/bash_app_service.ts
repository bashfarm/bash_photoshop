import _ from 'lodash';
import { ContextStoreState } from 'store/contextStore';
import { storage } from 'uxp';
import {
    createTempFileEntry,
    getTempFileEntry,
    saveActiveDocument,
    saveTextFile,
} from './io_service';
import JSZip from 'jszip';
import { BashfulAppProject, DialogType } from '../bashConstants';
import photoshop from 'photoshop';
import { executeInPhotoshop } from './middleware/photoshop_middleware';

const lfs = storage.localFileSystem;

/**
 * This function will save the bashful project to the file system.  It is the highest function in the stack that will save the bashful project.
 * @param contextStore
 */
export async function saveBashfulProject(contextStore: ContextStoreState) {
    try {
        let bashfulProjectEntry = await openBashfulFileDialog(DialogType.SAVE);

        let stateFileEntry = await createStateDataEntry();
        let psdFileEntry = await createPhotoshopFileEntry();

        await saveTextFile(stateFileEntry, JSON.stringify(contextStore));
        await saveActiveDocument(psdFileEntry);

        let zip = new JSZip();
        let storeCopy = _.cloneDeep(contextStore);
        zip.file(stateFileEntry.nativePath, JSON.stringify(storeCopy));
        zip.file(
            psdFileEntry.nativePath,
            psdFileEntry.read({ format: storage.formats.binary })
        );
        let zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
        bashfulProjectEntry.write(zipBlob, { format: storage.formats.binary });
    } catch (e) {
        console.error(e);
    }
}

/**
 * This functions creates a temporary file with the name of the state file that we will save to the file system and eventually zip
 * It is in a constant called BASHFUL_STATE_FILE_NAME, `bashful.json`.
 * @returns
 */
async function createStateDataEntry() {
    return await createTempFileEntry(BashfulAppProject.BASHFUL_STATE_FILE_NAME);
}

/**
 * This function creates a temporary file with the name of the photoshop file that we will save to the file system and eventually zip
 * It is in a constant called BASHFUL_PHOTOSHOP_FILE_NAME, `photoshop.psd`.
 * @returns
 */
async function createPhotoshopFileEntry() {
    try {
        let tempPsd = await getTempFileEntry(
            BashfulAppProject.BASHFUL_PHOTOSHOP_FILE_NAME
        );
        tempPsd.delete();
    } catch (e) {
        console.warn('Had to delete plugin temp file photoshop.psd');
    }

    return await createTempFileEntry(
        BashfulAppProject.BASHFUL_PHOTOSHOP_FILE_NAME
    );
}

async function extractPhotoshopPSD(zip: JSZip) {
    const matchingFiles = zip.filter((relativePath, file) => {
        return relativePath.endsWith('photoshop.psd');
    });

    if (matchingFiles.length === 0) {
        throw new Error('File not found');
    }

    const file = matchingFiles[0];

    // Extract the file contents as a Blob
    return await file.async('arraybuffer');
}

async function extractStateData(zip: JSZip) {
    const matchingFiles = zip.filter((relativePath, file) => {
        return relativePath.endsWith('bashful.json');
    });

    if (matchingFiles.length === 0) {
        throw new Error('File not found');
    }

    const file = matchingFiles[0];

    // Extract the file contents as a Blob
    return await file.async('string');
}

/**
 * This function will extract the photoshop file from the zip file and save it to the file system.
 * @param zip
 * @returns
 */
async function extractPhotoshopFile(zip: JSZip) {
    try {
        let photoshopFileEntry = await createPhotoshopFileEntry();

        // Save the photoshop file that is in the zip file as a file that we can load.
        let data = await extractPhotoshopPSD(zip);
        photoshopFileEntry.delete();
        photoshopFileEntry.write(data, { format: storage.formats.binary });
        return photoshopFileEntry;
    } catch (e) {
        console.error(e);
    }
}

/**
 * This opens a file dialog for the user to select a bashful project file, and only allows the selection of bashful project files.
 * @param dialogType
 * @returns
 */
async function openBashfulFileDialog(dialogType: DialogType) {
    if (dialogType === DialogType.SAVE) {
        let bashfulProjectEntry = await lfs.getFileForSaving('', {
            types: ['bashful'],
        });

        return bashfulProjectEntry;
    }

    return (await lfs.getFileForOpening({
        allowMultiple: false,
    })) as storage.File;
}

/**
 * This is the lowest function in the stack that will load the photoshop file.
 * @param photoshopFileEntry
 */
async function loadPhotoshopFile(photoshopFileEntry: storage.File) {
    await executeInPhotoshop(loadPhotoshopFile, async () => {
        await photoshop.app.open(photoshopFileEntry);
    });
}

/**
 * This function opens a dialog for the user to select a bashful project file.
 * @returns
 */
export async function getBashfulData() {
    let bashfulProjectEntry = await openBashfulFileDialog(DialogType.OPEN);
    return await JSZip.loadAsync(
        bashfulProjectEntry.read({ format: storage.formats.binary })
    );
}

/**
 * This function will load the bashful project from the file system.
 * @param contextSetter
 */
export async function loadBashfulProject(contextSetter: Function) {
    try {
        let bashfulData = await getBashfulData();
        let stateData = JSON.parse(await extractStateData(bashfulData));

        loadPhotoshopFile(await extractPhotoshopFile(bashfulData));
        contextSetter(stateData);
    } catch (e) {
        console.error(e);
    }
}
