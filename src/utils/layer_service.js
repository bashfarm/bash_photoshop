import { CreateAILayerContextId } from '../store/appStore';
import {
    GetNextAvailableHistoryFileName,
    SaveLayerToPluginData,
} from './io_service';

const photoshop = require('photoshop');
const app = photoshop.app;
const bp = photoshop.action.batchPlay;
const executeAsModal = photoshop.core.executeAsModal;
const lfs = require('uxp').storage.localFileSystem;

/**
 * This did not work.  Keeping it here as an exmaple.  Looks like christian cantrell also faced this issue when generating
 * images. https://www.youtube.com/watch?v=n9VZ97rT_Zs&ab_channel=ChristianCantrell
 * I am just going to create options for the AI workflow
 */
// function FitLayerToCanvas(keepAspect) {// keepAspect:Boolean - optional. Default to false
// 	let doc = app.activeDocument;
// 	let layer = doc.activeLayers[0];

// 	var width = doc.width;
// 	var height = doc.height;
// 	var bounds = layer.bounds;
// 	var layerWidth = bounds[2] - bounds[0];
// 	var layerHeight = bounds[3] - bounds[1];
// 	try {
// 		// move the layer so top left corner matches canvas top left corner
// 		layer.translate(0 - layer.bounds[0], 0 - layer.bounds[1]);
// 		if (!keepAspect) {
// 			// scale the layer to match canvas
// 			layer.scale((width / layerWidth) * 100, (height / layerHeight) * 100, photoshop.constants.AnchorPosition.TOPLEFT);
// 		} else {
// 			let layerRatio = layerWidth / layerHeight;
// 			let newWidth = width;
// 			let newHeight = ((1.0 * width) / layerRatio);
// 			if (newHeight >= height) {
// 				newWidth = layerRatio * height;
// 				newHeight = height;
// 			}
// 			let resizePercent = newWidth / layerWidth * 100;
// 			app.activeDocument.activeLayer.scale(resizePercent, resizePercent, AnchorPosition.TOPLEFT);
// 		}
// 	} catch (e) {
// 		console.error(e)
// 	}

// }

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
        await executeAsModal(
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
        await executeAsModal(async () => {
            app.activeDocument.layers.forEach((layer) => {
                if (layer.visible == true) layer.selected = true;
            });
        });

        if (verbose) console.log('Selecting all visible layers');
    } catch (e) {
        console.error(e);
    }
}

export function GetSelectedLayers() {
    return app.activeDocument.layers.filter((layer) => layer.selected);
}

export function GetTopLayer(selected = false, active = false) {
    if (selected) return GetSelectedLayers()[0];

    if (active) return photoshop.app.activeDocument.activeLayers[0];
    return photoshop.app.activeDocument.layers[0];
}

export function MoveLayerToTop(layer) {
    try {
        var topLayer = GetTopLayer();
        layer.move(topLayer, photoshop.constants.ElementPlacement.PLACEBEFORE);
    } catch (e) {
        console.log(e);
    }
}

export async function MoveLayer(
    layer,
    relativeLayer,
    placement = photoshop.constants.ElementPlacement.PLACEBEFORE
) {
    await executeAsModal(async () => {
        layer.move(relativeLayer, placement);
    });
}

export async function CreateMergedLayer() {
    try {
        console.log('we in create merged layer');

        await executeAsModal(async () => {
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
            var mergedLayer = GetTopLayer({ active: true });

            if (mergedLayer) {
                MoveLayerToTop(mergedLayer);
                mergedLayer.name = `Merged Layered: ${randomlyPickLayerName()}`;
                return mergedLayer;
            }
        });
    } catch (e) {
        console.error(e);
    }
}

function randomlyPickLayerName() {
    var items = [
        'Banana',
        'Kratos',
        'Goku',
        'Geralt',
        'All Might',
        'Midoriya',
        'Vegeta',
        'Botan',
        'Kuwabara',
    ];
    var item = items[Math.floor(Math.random() * items.length)];
    return item;
}

export async function DeselectLayers() {
    await executeAsModal(() => {
        GetSelectedLayers().forEach((layer) => {
            layer.selected = false;
        });
    });
}

export async function CreateTopLayerMask() {
    var topLayer = GetTopLayer();
    // Can't find a check if there is a layer mask on the layer before running batchplay.
    await CreateLayerMask(topLayer);
}

export async function CreateLayerMask(layer) {
    await executeAsModal(async () => {
        await DeselectLayers();
        layer.selected = true;
        await app.batchPlay([
            {
                _obj: 'make',
                at: { _enum: 'channel', _ref: 'channel', _value: 'mask' },
                new: { _class: 'channel' },
                using: { _enum: 'userMaskEnabled', _value: 'revealAll' },
            },
        ]);
    });
}

export async function selectLayerMask(layer) {
    let command;

    try {
        // Select mask channel of layer “Merged Layered: Geralt”
        command = {
            _obj: 'select',
            _target: [
                { _enum: 'channel', _ref: 'channel', _value: 'mask' },
                { _id: layer.id, _ref: 'layer' },
            ],
            makeVisible: false,
        };
        executeAsModal(async () => {
            return await bp([command], {});
        });
        console.log(`Selecting mask of layer ${layer.name}, id: ${layer.id}`);
    } catch (e) {
        console.error(e);
    }
}

/**
 * This function is made to return the unique contexts that are available.  A context can be associated with multiple layers
 * or have been created from another layer originally and then passed to another layer that still exists while the original does not.
 * @param {} layerAIContextStore
 * @returns
 */
// function GetUniqueContexts(layerAIContextStore){
// 	let aiContext;
// 	let uniqueContexts = [];

// 	for(let contextKey of Object.keys(layerAIContextStore)){
// 		aiContext = layerAIContextStore[contextKey]
// 		if (!uniqueContexts.includes(aiContext.id))
// 			uniqueContexts.push(aiContext)
// 	}
// 	return uniqueContexts
// }

/**
 * Every Layer has had a context created for them unless they inherited a context.
 * @param {} layer
 * @param {*} layerAIContextStore
 * @returns
 */
export function GetLayerAIContext(layer, layerAIContextStore) {
    return layerAIContextStore[CreateAILayerContextId(layer)];
}

export function GetDeletedLayersThatNeedToBeRemovedFromContexts(
    layerAIContextStore
) {
    let docLayerIds = GetDocumentLayerContextIds();
    let layersThatHaveBeenDeletedAndContextsRemain = Object.keys(
        layerAIContextStore
    ).filter((x) => !docLayerIds.includes(parseInt(x)));
    return layersThatHaveBeenDeletedAndContextsRemain;
}

export function GetDocumentLayerIds() {
    return app.activeDocument.layers.map((layer) => layer.id);
}

export function GetDocumentLayerContextIds() {
    return app.activeDocument.layers.map((layer) =>
        CreateAILayerContextId(layer)
    );
}

/**
 * This function will duplicate the given layer and return a reference to it.
 * @param {*} layer
 */
// async function DuplicateLayer(layer){

// 		// Duplicate current layer
// 		command = {"ID":[layer.id],"_obj":"duplicate","_target":[{"_enum":"ordinal","_ref":"layer","_value":"targetEnum"}],"version":5};
// 		executeAsModal(async () => {
// 			return await bp([command], {})
// 		})

// 	return GetNewestLayer()
// }

/**
 * This function will retrieve the last created layer.  The layer with the highest value id must be the latest one created
 * @returns
 */
export function GetNewestLayer() {
    return app.activeDocument.layers.reduce((prev, current) =>
        +prev.id > +current.id ? prev : current
    );
}

/**
 * Save the current layer context to the contexts historical files.  Return the new file name
 */
export async function SaveLayerContexttoHistory(layerAIContext) {
    try {
        let fileName = await GetNextAvailableHistoryFileName(layerAIContext);
        if (!fileName) {
            return;
        }
        await SaveLayerToPluginData(fileName, layerAIContext.currentLayer);
        return fileName;
    } catch (e) {
        console.error(e);
    }
}
