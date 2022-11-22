const photoshop = require('photoshop');
const fs = require('uxp').storage.localFileSystem;
const app = photoshop.app;
const bp = photoshop.action.batchPlay;
const executeAsModal = photoshop.core.executeAsModal;
const lfs = require('uxp').storage.localFileSystem;
const base64js = require('base64-js');
import { SaveMergedLayersImgPNGToDataFolder } from './io_service';
import { GetDataFolderImageBase64ImgStr  } from './io_service';
/**
 * The entry point to the service.  For now...
 * @returns null if there is not more than one visible layer
 */
export async function MergeAndSaveAllVisibleLayersIntoImage(fileName) {
    try {
        if (!IsMoreThanOneVisibleLayer()) {
            console.log(
                'Could not merge visible layers as only one was available'
            );
            return;
        }

        await mergeVisibleLyrs();
        await MakeLayersInvisible();
        SaveMergedLayersImgPNGToDataFolder(fileName);
		var fileB64Obj = await GetDataFolderImageBase64ImgStr(fileName)

		console.log("setting merged b64")
		console.log(fileB64Obj['imageHeader'] + fileB64Obj['base64Data'])
		console.log("done setting merged b64")
		return fileB64Obj['imageHeader'] + fileB64Obj['base64Data']
		 
    } catch (e) {
        console.log(e);
    }
}

/**
 * @returns {Array} the visible layers in the active document
 */
export function GetVisibleLayers() {
    var visibleLayers = app.activeDocument.layers
        .map((layer) => {
            if (layer.visible) return layer;
        })
        .filter((layer) => {
            return layer ? true : false;
        });
    return visibleLayers;
}

/**
 * Turns all visible layers invisible except the first one that was merged.
 * After this we typically need to send this to the API to generate new details.
 */
async function MakeLayersInvisible() {
    await executeAsModal(async () => {
        for (var visibleLayer of GetVisibleLayers().slice(1)) {
            // Might not be defined.  Thats cool 👍
            if (visibleLayer) visibleLayer.visible = false;
        }
    });
}

/**
 *
 * @returns {Boolean} true if there are more than one visible layers in the active document
 */
export function IsMoreThanOneVisibleLayer() {
    return GetVisibleLayers().length > 1;
}

async function mergeVisibleLyrs() {
    try{
        const res = await executeAsModal(async () => {
            var visibleLayers = GetVisibleLayers();
            visibleLayers[0].selected = true;
            await bp(
                [
                    {
                        _obj: 'mergeVisible',
                        duplicate: true,
                        _options: {
                            dialogOptions: 'dontDisplay',
                        },
                    },
                ],
                { commandName: 'Generate Combined Layers' }
            );
        });
        console.log('finished Merging Layers');
    } catch(e){
        console.log(e)
    }

}

export const PlaceImageFromDataOnLayer = async (imageName) => {
    try {
        const dataFolder = await lfs.getDataFolder();
        var placedDocument = await dataFolder.getEntry(imageName);
        if (!placedDocument) return;
        let tkn = lfs.createSessionToken(placedDocument);
        const res = await executeAsModal(
            async () => {
                await bp(
                    [
                        {
                            _obj: 'placeEvent',
                            target: { _path: tkn, _kind: 'local' },
                            linked: true,
                        },
                    ],
                    {}
                );
                app.activeDocument.activeLayers[0].rasterize();
            },
            { commandName: 'open File' }
        );
    } catch (e) {
        console.log(e);
    }
};


/***
 * Not working
 */
export async function SetNewestLayerOnTop(){
    var layers = GetVisibleLayers();
    var maxLayer = Math.max(...layers.map(o => o._id))
    const res = await executeAsModal(
        async () => {
    removeItem(app.activeDocument.activeLayers, maxLayer)
    app.activeDocument.activeLayers.push(maxLayer)
        })
    
}

function removeItem(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

async function SelectLayer(layer){
    const res = await executeAsModal(
        async () => {
            await bp(
                [
                    {
                      "_obj": "select",
                      "_target": [{ "_name": layer._name, "_ref": "layer" }],
                      "layerID": [layer._id],
                      "makeVisible": true
                    }
                  ]
                  ,
                {}
            );
        },
        { commandName: 'Select Layer' }
    );
      
}
