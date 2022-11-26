const photoshop = require('photoshop');
const fs = require('uxp').storage.localFileSystem;
const app = photoshop.app;
const bp = photoshop.action.batchPlay;
const executeAsModal = photoshop.core.executeAsModal;
const lfs = require('uxp').storage.localFileSystem;
const base64js = require('base64-js');
import { GetDataFolderImageBase64ImgStr, SaveB64ImageToBinaryFileToDataFolder  } from './io_service';

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
 *
 * @returns {Boolean} true if there are more than one visible layers in the active document
 */
export function IsMoreThanOneVisibleLayer() {
    return GetVisibleLayers().length > 1;
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


async function SelectAllVisibleLayers(verbose = true) {
    try {
        const res = await executeAsModal(async () => {
            app.activeDocument.layers.forEach((layer) => {
                if (layer.visible == true) layer.selected = true;
            });
        });

        if (verbose) console.log(`Selecting all visible layers`);
    } catch (e) {
        console.error(e);
    }
}

export function GetSelectedLayers() {
    return app.activeDocument.layers.filter((layer) => layer.selected);
}


export function GetTopLayer(selected=false, active=false){
	if (selected)
    	return GetSelectedLayers()[0];
	
	if (active)
		return photoshop.app.activeDocument.activeLayers[0]
	return photoshop.app.activeDocument.layers[0]
}

export function MoveLayerToTop(layer){
	try{
		var topLayer = GetTopLayer()
		layer.move(
			topLayer,
			photoshop.constants.ElementPlacement.PLACEBEFORE
		);
	}catch(e){
		console.log(e)
	}

}


export async function CreateMergedLayer() {
    try {
        console.log('we in create merged layer');

        const res = await executeAsModal(async () => {
            await SelectAllVisibleLayers();
            var selectedLayers = GetSelectedLayers();
            selectedLayers.forEach(async (layer) => {
                if (layer.visible) {
                    var newLayer = await layer.duplicate({
                        insertionLocation:
                            photoshop.constants.ElementPlacement.PLACEBEFORE,
                    });
                    newLayer.selected = false;
                    newLayer.visible = true;
                    return newLayer;
                }
            });
            selectedLayers.forEach((layer) => {
                layer.visible = false;
                layer.selected = false;
            });

            // Merge all visible layers
            await photoshop.app.activeDocument.mergeVisibleLayers();

            // Get reference to layers
            var mergedLayer = GetTopLayer({active: true})

			if (mergedLayer){
				MoveLayerToTop(mergedLayer)
				mergedLayer.name = `Merged Layered: ${randomlyPickLayerName()}`
				return mergedLayer;
			}

        });

    } catch (e) {
        console.error(e);
    }
}

function randomlyPickLayerName(){
	var items = ["Banana", "Kratos", "Goku", "Geralt", "All Might", "Midoriya", "Vegeta", "Botan", "Kuwabara"]
	var item = items[Math.floor(Math.random()*items.length)];
	return item
}


export async function DeselectLayers(){
	await executeAsModal(() => {
		GetSelectedLayers().forEach((layer) => {
			layer.selected = false
		})
	})
}

export async function CreateTopLayerMask(){
	var topLayer = GetTopLayer();
	// Can't find a check if there is a layer mask on the layer before running batchplay. 
	await CreateLayerMask(topLayer)
}

export async function CreateLayerMask(layer){
	await executeAsModal(async () => {
		await DeselectLayers()
		layer.selected = true
		await app.batchPlay([
			{
				"_obj": "make",
				"at": { "_enum": "channel", "_ref": "channel", "_value": "mask" },
				"new": { "_class": "channel" },
				"using": { "_enum": "userMaskEnabled", "_value": "revealAll" }
			}
		]
		)
	})

}


