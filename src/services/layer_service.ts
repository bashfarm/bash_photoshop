import { randomlyPickLayerName } from '../utils/general_utils';
import { getDataFolderEntry } from './io_service';
import { executeInPhotoshop } from './middleware/photoshop_middleware';
import { storage } from 'uxp';
import photoshop, { app, action } from 'photoshop';
import { Layer } from 'photoshop/dom/Layer';
import { ElementPlacement, RasterizeType } from 'photoshop/dom/Constants';

// const app = photoshop.app;
// const bp = photoshop.action.batchPlay;
// const lfs = require('uxp').storage.localFileSystem;
const lfs = storage.localFileSystem;
const bp = action.batchPlay;
/**
 * Given a an Array of photoshop layers, return the array of layers that are visible
 * @param {Array} layers
 * @returns Visible layer array
 */
export function getVisibleLayers(layers: Layer[]): Layer[] {
    return layers.filter((layer) => {
        return layer.visible;
    });
}

/**
 * Creates a new layer from an image found in the plugin data folder.
 */
export async function createNewLayerFromImage(
    imageName: string,
    relativeLayer: Layer,
    relativeLayerPlacement: ElementPlacement,
    rasterize = true
): Promise<void> {
    await createNewLayerFromFile(imageName, rasterize);
    const newestLayer = getNewestLayer(photoshop.app.activeDocument.layers);
    moveLayer(newestLayer, relativeLayer, relativeLayerPlacement);
}

/**
 * Create a new layer from the filename.  The file name is relative to the plugin.  This means that only files in the plugin data
 * folder on the user's local machine will be found.
 */
export async function createNewLayerFromFile(
    fileName: string,
    rasterize: boolean = true
): Promise<void> {
    const fileEntry = await getDataFolderEntry(fileName);
    if (!fileEntry) return;
    const tkn = lfs.createSessionToken(fileEntry);

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
            if (rasterize)
                app.activeDocument.activeLayers[0].rasterize(
                    RasterizeType.ENTIRELAYER
                );
        }
        // { commandName: 'open File' }
    );
}

/**
 * Selects all the visible layers and returns a list of the selected layers
 * @returns {Array}
 */
async function selectAllVisibleLayers(): Promise<Layer[]> {
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
export function getSelectedLayers(): Layer[] {
    return app.activeDocument.layers.filter((layer) => layer.selected);
}

/**
 * Retrieve the top most layer in the app.
 */
export function getTopLayer(
    selected: boolean = false,
    active: boolean = false
): Layer {
    if (selected) return getSelectedLayers()[0];

    if (active) return photoshop.app.activeDocument.activeLayers[0];
    return photoshop.app.activeDocument.layers[0];
}

/**
 * Convenience function to move this layer to the top of the app.
 */
export function moveLayerToTop(layer: Layer) {
    try {
        moveLayer(layer, getTopLayer());
    } catch (e) {
        console.log(e);
    }
}

/**
 * Move the given layer to a position relative to the second layer passed.
 */
export async function moveLayer(
    layer: Layer,
    relativeLayer: Layer,
    placement: ElementPlacement = photoshop.constants.ElementPlacement
        .PLACEBEFORE
): Promise<void> {
    await executeInPhotoshop(async () => {
        layer.move(relativeLayer, placement);
    });
}

/**
 * Create a newly merged layer given all the visible layers.
 */
export async function createMergedLayer(): Promise<void> {
    await executeInPhotoshop(async () => {
        selectAllVisibleLayers();

        const selectedLayers = getSelectedLayers();
        selectedLayers.forEach(async (layer) => {
            if (layer.visible) {
                const newLayer = await duplicateLayer(layer);
                newLayer.selected = false;
                newLayer.visible = true;
                layer.visible = false;
                layer.selected = false;
                return newLayer;
            }
        });
        const mergedLayer = await mergeVisibleLayers();

        if (mergedLayer) {
            moveLayerToTop(mergedLayer);
            mergedLayer.name = `Merged Layered: ${randomlyPickLayerName()}`;
            return mergedLayer;
        }
    });
}

/**
 * Merge the visible layers in the app and return the merged layer.
 */
export async function mergeVisibleLayers() {
    await executeInPhotoshop(async () => {
        // Merge all visible layers
        await photoshop.app.activeDocument.mergeVisibleLayers();

        // Get reference to layers
    });
    return getTopLayer(undefined, true);
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
 */
export async function createLayerMask(layer: Layer) {
    await executeInPhotoshop(async () => {
        await deselectLayers();
        layer.selected = true;
        await app.batchPlay(
            [
                {
                    _obj: 'make',
                    at: { _enum: 'channel', _ref: 'channel', _value: 'mask' },
                    new: { _class: 'channel' },
                    using: { _enum: 'userMaskEnabled', _value: 'revealAll' },
                },
            ],
            {}
        );
    });
}

/**
 * This function selects the mask of the given layer if there is one.  This is needed to begin painting on the mask.
 */
export async function selectLayerMask(layer: Layer) {
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
 */
async function duplicateLayer(layer: Layer) {
    await executeInPhotoshop(async () => {
        await layer.duplicate(
            undefined,
            photoshop.constants.ElementPlacement.PLACEBEFORE,
            undefined
        );
    });

    return getNewestLayer(photoshop.app.activeDocument.layers);
}

/**
 * This function will retrieve the last created layer.  The layer with the highest value id must be the latest one created
 */
export function getNewestLayer(layers: Layer[]) {
    return layers.reduce((prev, current) =>
        +prev.id > +current.id ? prev : current
    );
}

/**
 * Given photoshop layers, make the given invisible
 */
export async function makeLayersInvisible(layers: Layer[]) {
    await executeInPhotoshop(async () => {
        layers.forEach((layer) => {
            layer.visible = false;
        });
    });
}

/**
 * Given photoshop layers, make the given invisible
 */
export async function makeLayersVisible(layers: Layer[]) {
    await executeInPhotoshop(async () => {
        layers.forEach((layer) => {
            layer.visible = true;
        });
    });
}

/**
 * Delete the given layer.
 */
export async function deleteLayer(layer: Layer) {
    await executeInPhotoshop(async () => {
        layer.delete();
    });
}
