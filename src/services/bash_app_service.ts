import _ from 'lodash';
import { ContextStoreState } from 'store/contextStore';
import { storage } from 'uxp';
import {
    createTempFileEntry,
    getTempFileEntry,
    saveActiveDocument,
} from './io_service';
import JSZip from 'jszip';
import { BashfulAppProject } from '../constants';
import photoshop from 'photoshop';
import { executeInPhotoshop } from './middleware/photoshop_middleware';
import { plainToInstance } from 'class-transformer';

const lfs = storage.localFileSystem;

export async function saveBashfulProject(contextStore: ContextStoreState) {
    let copyOfState = _.cloneDeep(contextStore);
    let tempFolder = await lfs.getTemporaryFolder();
    let bashfulProjectEntry = await lfs.getFileForSaving('', {
        types: ['bashful'],
    });
    if (bashfulProjectEntry.name.endsWith('.bashful') === false) {
        bashfulProjectEntry.name = bashfulProjectEntry.name + '.bashful';
    }

    console.log(bashfulProjectEntry);

    let stateFileEntry = (await tempFolder.createEntry(
        BashfulAppProject.BASHFUL_STATE_FILE_NAME,
        { type: storage.types.file, overwrite: true }
    )) as storage.File;
    let psdFileEntry = (await tempFolder.createEntry(
        BashfulAppProject.BASHFUL_PHOTOSHOP_FILE_NAME,
        { type: storage.types.file, overwrite: true }
    )) as storage.File;
    stateFileEntry.write(JSON.stringify(copyOfState), {
        format: storage.formats.utf8,
    });
    await saveActiveDocument(psdFileEntry);
    let zip = new JSZip();
    zip.file(stateFileEntry.nativePath, JSON.stringify(copyOfState));
    zip.file(
        psdFileEntry.nativePath,
        psdFileEntry.read({ format: storage.formats.binary })
    );
    let zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
    bashfulProjectEntry.write(zipBlob, { format: storage.formats.binary });
}

export async function loadBashfulProject(contextSetter: Function) {
    let bashfulProjectEntry = (await lfs.getFileForOpening({
        allowMultiple: false,
    })) as storage.File;
    console.log(contextSetter);
    try {
        let zip = await JSZip.loadAsync(
            bashfulProjectEntry.read({ format: storage.formats.binary })
        );
        console.log(zip);
        let photoshopFileEntry = await createTempFileEntry(
            BashfulAppProject.BASHFUL_PHOTOSHOP_FILE_NAME
        );
        let stateEntry = await createTempFileEntry(
            BashfulAppProject.BASHFUL_STATE_FILE_NAME
        );

        let stateData = await zip.files[stateEntry.nativePath].async('string');
        // Save the photoshop file that is in the zip file as a file that we can load.
        let data = await zip.files[photoshopFileEntry.nativePath].async(
            'arraybuffer'
        );
        photoshopFileEntry.write(data, { format: storage.formats.binary });
        let newStateObj = plainToInstance(
            ContextStoreState,
            JSON.parse(stateData)
        );
        console.log(newStateObj);
        contextSetter(newStateObj);

        // Load the photoshop file
        await executeInPhotoshop(loadBashfulProject, async () => {
            await photoshop.app.open(photoshopFileEntry);
        });
    } catch (e) {
        console.error(e);
    }
}
