import _ from 'lodash';
import { ContextStoreState } from 'store/contextStore';
import { storage } from 'uxp';
import {
    createTempFileEntry,
    saveActiveDocument,
    saveTextFile,
} from './io_service';
import JSZip from 'jszip';
import { BashfulAppProject, DialogType } from '../constants';
import photoshop from 'photoshop';
import { executeInPhotoshop } from './middleware/photoshop_middleware';

const lfs = storage.localFileSystem;

export async function saveBashfulProject(contextStore: ContextStoreState) {
    try {
        let bashfulProjectEntry = await openBashfulFileDialog(DialogType.SAVE);

        let stateFileEntry = await createStateDataEntry();
        let psdFileEntry = await createPhotoshopFileEntry();

        await saveTextFile(stateFileEntry, JSON.stringify(contextStore));
        await saveActiveDocument(psdFileEntry);

        let zip = new JSZip();
        zip.file(stateFileEntry.nativePath, JSON.stringify(contextStore));
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

async function createStateDataEntry() {
    return await createTempFileEntry(BashfulAppProject.BASHFUL_STATE_FILE_NAME);
}

async function createPhotoshopFileEntry() {
    return await createTempFileEntry(
        BashfulAppProject.BASHFUL_PHOTOSHOP_FILE_NAME
    );
}

async function extractStateData(zip: JSZip) {
    let stateEntry = await createStateDataEntry();
    return await zip.files[stateEntry.nativePath].async('string');
}

async function extractPhotoshopFile(zip: JSZip) {
    try {
        let photoshopFileEntry = await createPhotoshopFileEntry();

        // Save the photoshop file that is in the zip file as a file that we can load.
        let data = await zip.files[photoshopFileEntry.nativePath].async(
            'arraybuffer'
        );
        photoshopFileEntry.write(data, { format: storage.formats.binary });
        return photoshopFileEntry;
    } catch (e) {
        console.error(e);
    }
}

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

async function loadPhotoshopFile(photoshopFileEntry: storage.File) {
    await executeInPhotoshop(loadPhotoshopFile, async () => {
        await photoshop.app.open(photoshopFileEntry);
    });
}

export async function getBashfulData() {
    let bashfulProjectEntry = await openBashfulFileDialog(DialogType.OPEN);
    return await JSZip.loadAsync(
        bashfulProjectEntry.read({ format: storage.formats.binary })
    );
}

export async function loadBashfulProject(contextSetter: Function) {
    try {
        let bashfulData = await getBashfulData();
        let stateData = await extractStateData(bashfulData);
        loadPhotoshopFile(await extractPhotoshopFile(bashfulData));
        contextSetter(stateData);
    } catch (e) {
        console.error(e);
    }
}
