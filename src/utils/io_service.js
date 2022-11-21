const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;
const types = require('uxp').storage.types;
const formats = require('uxp').storage.formats;
const bp = photoshop.action.batchPlay;
const executeAsModal = photoshop.core.executeAsModal;

function _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// My Functions
export async function GetDataFolderImageBase64ImgStr(fileName) {
    var header = 'data:image/png;base64, ';
    const dataFolder = await fs.getDataFolder();
    var placedDocument = await dataFolder.getEntry(fileName);
    var binaryData = await placedDocument.read({ format: formats.binary });
    try {
        const base64String = _arrayBufferToBase64(binaryData);
        console.log();
        // console.log(base64Encode(binaryData))
        // console.log(header + btoa(binaryData) )
        console.log('executing base64');
        return { imageHeader: header, base64Data: base64String };
    } catch (e) {
        console.log(e);
    }
}

export async function SaveMergedLayersImgPNGToDataFolder() {
    try {
        console.log('trying to save image');
        const dataFolder = await fs.getDataFolder();
        let entry = dataFolder.createEntry('mergedLayersImg.png', {
            type: types.file,
            overwrite: true,
        });
        let res = await entry;
        let tkn = fs.createSessionToken(res);
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
        console.log('image saved');
    } catch (e) {
        console.log(e);
    }
}
