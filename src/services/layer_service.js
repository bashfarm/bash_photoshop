import { randomlyPickLayerName } from '../utils/general_utils';
import { getDataFolderEntry } from './io_service';
import { executeInPhotoshop } from './middleware/photoshop_middleware';

const photoshop = require('photoshop');
const app = photoshop.app;
const bp = photoshop.action.batchPlay;
const lfs = require('uxp').storage.localFileSystem;

/**
 * Given a an Array of photoshop layers, return the array of layers that are visible
 * @param {Array} layers
 * @returns {Array}
 */
export function getVisibleLayers(layers) {
    return layers.filter((layer) => {
        return layer.visible;
    });
}

/**
 * Creates a new layer from an image found in the plugin data folder.
 * @param {String} imageName
 * @param {*} relativeLayer
 * @param {*} relativeLayerPlacement
 * @param {Boolean} rasterize
 */
export async function createNewLayerFromImage(
    imageName,
    relativeLayer,
    relativeLayerPlacement,
    rasterize = true
) {
    await createNewLayerFromFile(imageName, rasterize);
    let newestLayer = getNewestLayer(photoshop.app.activeDocument.layers);
    moveLayer(newestLayer, relativeLayer, relativeLayerPlacement);
}

/**
 * Create a new layer from the filename.  The file name is relative to the plugin.  This means that only files in the plugin data
 * folder on the user's local machine will be found.
 * @param {String} fileName
 * @param {Boolean} rasterize
 * @returns
 */
export const createNewLayerFromFile = async (fileName, rasterize = true) => {
    let fileEntry = await getDataFolderEntry(fileName);
    if (!fileEntry) return;
    let tkn = lfs.createSessionToken(fileEntry);

    await executeInPhotoshop(
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
            // if we place a new image on the layer, we may not want to rasterize it
            // it is a smartobject.  We might be able to replace, but I think there were some issues with
            // that and had to rasterize
            if (rasterize) app.activeDocument.activeLayers[0].rasterize();
        },
        { commandName: 'open File' }
    );
};

/**
 * Selects all the visible layers and returns a list of the selected layers
 * @param {*} verbose
 * @returns {Array}
 */
async function selectAllVisibleLayers() {
    await executeInPhotoshop(async () => {
        getVisibleLayers(app.activeDocument.layers).forEach((layer) => {
            layer.selected = true;
        });
    });

    return getSelectedLayers();
}

/**
 * Retrieve an Array of photoshop layers that are selected in the app.
 * @returns
 */
export function getSelectedLayers() {
    return app.activeDocument.layers.filter((layer) => layer.selected);
}

/**
 * Retrieve the top most layer in the app.
 * @param {Boolean} selected
 * @param {Boolean} active
 * @returns
 */
export function getTopLayer(selected = false, active = false) {
    if (selected) return getSelectedLayers()[0];

    if (active) return photoshop.app.activeDocument.activeLayers[0];
    return photoshop.app.activeDocument.layers[0];
}

/**
 * Convenience function to move this layer to the top of the app.
 * @param {*} layer
 */
export function moveLayerToTop(layer) {
    try {
        moveLayer(layer, getTopLayer());
    } catch (e) {
        console.log(e);
    }
}

/**
 * Move the given layer to a position relative to the second layer passed.
 * @param {*} layer
 * @param {*} relativeLayer
 * @param {*} placement
 */
export async function moveLayer(
    layer,
    relativeLayer,
    placement = photoshop.constants.ElementPlacement.PLACEBEFORE
) {
    await executeInPhotoshop(async () => {
        layer.move(relativeLayer, placement);
    });
}

/**
 * Create a newly merged layer given all the visible layers.
 */
export async function createMergedLayer() {
    await executeInPhotoshop(async () => {
        selectAllVisibleLayers();
        var selectedLayers = getSelectedLayers();
        selectedLayers.forEach(async (layer) => {
            if (layer.visible) {
                let newLayer = await duplicateLayer(layer);
                newLayer.selected = false;
                newLayer.visible = true;
                layer.visible = false;
                layer.selected = false;
                return newLayer;
            }
        });
        let mergedLayer = await mergeVisibleLayers();

        if (mergedLayer) {
            moveLayerToTop(mergedLayer);
            mergedLayer.name = `Merged Layered: ${randomlyPickLayerName()}`;
            return mergedLayer;
        }
    });
}

/**
 * Merge the visible layers in the app and return the merged layer.
 * @returns the merged layer
 */
export async function mergeVisibleLayers() {
    await executeInPhotoshop(async () => {
        // Merge all visible layers
        await photoshop.app.activeDocument.mergeVisibleLayers();

        // Get reference to layers
    });
    return getTopLayer({ active: true });
}

/**
 * Deselect all layers in the app.
 */
export async function deselectLayers() {
    await executeInPhotoshop(() => {
        getSelectedLayers().forEach((layer) => {
            layer.selected = false;
        });
    });
}

/**
 * Creates a layer mask to hide and unhide details on the given layer.
 * @param {*} layer
 */
export async function createLayerMask(layer) {
    await executeInPhotoshop(async () => {
        await deselectLayers();
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

/**
 * This function selects the mask of the given layer if there is one.  This is needed to begin painting on the mask.
 * @param {*} layer
 */
export async function selectLayerMask(layer) {
    executeInPhotoshop(async () => {
        return await bp(
            [
                {
                    _obj: 'select',
                    _target: [
                        {
                            _enum: 'channel',
                            _ref: 'channel',
                            _value: 'mask',
                        },
                        { _id: layer.id, _ref: 'layer' },
                    ],
                    makeVisible: false,
                },
            ],
            {}
        );
    });
}

/**
 * This function will duplicate the given layer and return a reference to it.
 * @param {*} layer
 */
async function duplicateLayer(layer) {
    await executeInPhotoshop(async () => {
        await layer.duplicate({
            insertionLocation: photoshop.constants.ElementPlacement.PLACEBEFORE,
        });
    });

    return getNewestLayer(photoshop.app.activeDocument.layers);
}

/**
 * This function will retrieve the last created layer.  The layer with the highest value id must be the latest one created
 * @param {Array} layers
 * @returns {*} layer
 */
export function getNewestLayer(layers) {
    return layers.reduce((prev, current) =>
        +prev.id > +current.id ? prev : current
    );
}

/**
 * Given photoshop layers, make the given invisible
 * @param {Array} layers
 */
export async function makeLayersInvisible(layers) {
    await executeInPhotoshop(async () => {
        layers.forEach((layer) => {
            layer.visible = false;
        });
    });
}

/**
 * Given photoshop layers, make the given invisible
 * @param {Array} layers
 */
export async function makeLayersVisible(layers) {
    await executeInPhotoshop(async () => {
        layers.forEach((layer) => {
            layer.visible = true;
        });
    });
}

/**
 * Delete the given layer.
 * @param {*} layer
 */
export async function deleteLayer(layer) {
    await executeInPhotoshop(async () => {
        layer.delete();
    });
}
