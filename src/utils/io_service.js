const lfs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;
const types = require('uxp').storage.types;
const formats = require('uxp').storage.formats;
const bp = photoshop.action.batchPlay;
const executeAsModal = photoshop.core.executeAsModal;
const base64js = require('base64-js');
import { UnformatBase64Image } from './ai_service';
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
 * @param {*} base64Data
 * @returns
 */
function IsBase64Str(base64Data) {
    var base64Rejex =
        /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;
    var isBase64Valid = base64Rejex.test(base64Data); // base64Data is the base64 string

    if (isBase64Valid) {
        // true if base64 formate
        console.log('It is base64');
        return true;
    } else {
        // false if not in base64 formate
        console.log('it is not in base64');
        return false;
    }
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

export async function SaveMergedLayersImgPNGToDataFolder(fileName) {
    try {
        console.log('trying to save image');
        const dataFolder = await lfs.getDataFolder();
        let entry = dataFolder.createEntry(fileName, {
            type: types.file,
            overwrite: true,
        });
        let res = await entry;
        let tkn = lfs.createSessionToken(res);
        console.log('after token');
        // let res = await entry;
        console.log(res.toString());
        await executeAsModal(async () => {
            await bp(
                [
                    {
                        _obj: 'save',
                        as: {
                            _obj: 'PNGFormat',
                            method: { _enum: 'PNGMethod', _value: 'thorough' },
                        },
                        in: { _path: tkn, _kind: 'local' }, // <= using the token here to save w/ different name
                        lowerCase: true,
                        saveStage: {
                            _enum: 'saveStageType',
                            _value: 'saveBegin',
                        },
                    },
                ],
                { commandName: 'Save File to Plugin Folder' }
            );
        });
        console.log(`image saved: '${fileName}'`);
    } catch (e) {
        console.log(e);
    }
}
