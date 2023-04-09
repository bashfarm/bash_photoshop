import {
    createLayerFileName,
    randomlyPickLayerName,
} from '../utils/general_utils';
import { getDataFolderEntry, saveLayerToPluginData } from './io_service';
import { executeInPhotoshop } from './middleware/photoshop_middleware';
import { Layer } from 'photoshop/dom/Layer';
import {
    AnchorPosition,
    ElementPlacement,
    RasterizeType,
    ResampleMethod,
} from 'photoshop/dom/Constants';
import photoshop from 'photoshop';
import { AngleValue, PercentValue, PixelValue } from 'photoshop/util/unit';
import { Document } from 'photoshop/dom/Document';
import { storage } from 'uxp';
import { getHeightScale, getWidthScale } from 'utils/layer_utils';
import { generateAILayer } from './ai_service';
import LayerAIContext from 'models/LayerAIContext';

const lfs = storage.localFileSystem;
const bp = photoshop.action.batchPlay;
const app = photoshop.app;

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
 * Create a new layer from the filename.  The file name is relative to the plugin.  This means that only files in the plugin data
 * folder on the user's local machine will be found.
 */
export async function createNewLayerFromFile(
    fileName: string,
    rasterize: boolean = true
): Promise<Layer> {
    const fileEntry = await getDataFolderEntry(fileName);
    if (!fileEntry) return;
    const tkn = lfs.createSessionToken(fileEntry);

    await executeInPhotoshop(
        createNewLayerFromFile,
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
    return getNewestLayer(app.activeDocument.layers);
}

/**
 * Retrieve an Array of photoshop layers that are selected in the app.
 * @returns
 */
export function getSelectedLayers(layers: Layer[]): Layer[] {
    return layers.filter((layer) => layer.selected);
}

/**
 * Retrieve the top most layer in the app.
 */
export function getTopLayer(
    selected: boolean = false,
    active: boolean = false
): Layer {
    if (selected) {
        return getSelectedLayers(app.activeDocument.layers)[0];
    }

    if (active) {
        return photoshop.app.activeDocument.activeLayers[0];
    }
    return photoshop.app.activeDocument.layers[0];
}

/**
 * Convenience function to move this layer to the top of the app.
 */
export async function moveLayerToTop(layer: Layer) {
    try {
        await moveLayer(layer, getTopLayer());
    } catch (e) {
        console.error('Moving Layer to Top', e);
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
    await executeInPhotoshop(moveLayer, async () => {
        layer.move(relativeLayer, placement);
    });
}

/**
 * Deselect all layers in the app.
 */
export async function deselectLayers() {
    await executeInPhotoshop(deselectLayers, () => {
        getSelectedLayers(app.activeDocument.layers).forEach((layer) => {
            if (layer) {
                layer.selected = false;
            }
        });
    });
}

/**
 * Creates a layer mask to hide and unhide details on the given layer.
 */
export async function createLayerMask(layer: Layer) {
    await executeInPhotoshop(createLayerMask, async () => {
        await deselectLayers();
        if (layer) {
            layer.selected = true;
        }
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
    await executeInPhotoshop(selectLayerMask, async () => {
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
export async function duplicateLayer(
    layer: Layer,
    relativeObject?: Document | Layer,
    insertionLocation?: ElementPlacement,
    name?: string
) {
    return await executeInPhotoshop(duplicateLayer, async () => {
        return await layer.duplicate(relativeObject, insertionLocation, name);
    });
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
    await executeInPhotoshop(makeLayersInvisible, async () => {
        layers.forEach((layer) => {
            layer.visible = false;
        });
    });
}

/**
 * Given photoshop layers, make the given invisible
 */
export async function makeLayersVisible(layers: Layer[]) {
    await executeInPhotoshop(makeLayersVisible, async () => {
        layers.forEach((layer) => {
            layer.visible = true;
        });
    });
}

/**
 * Deletes this layer from the document.
 */
export async function deleteLayer(layer: Layer) {
    await executeInPhotoshop(deleteLayer, async () => {
        layer.delete();
    });
}

/**
 * Merges layers. This operates on the currently selected layers. If multiple layers are selected, they will be merged together. If one layer is selected, it is merged down with the layer beneath. In this case, the layer below must be a pixel layer. The merged layer will now be the active layer.
 */
export async function mergeSelectedLayer(layer: Layer): Promise<Layer> {
    return await executeInPhotoshop(mergeSelectedLayer, async () => {
        return layer.merge();
    });
}
/**
 * Converts the targeted contents in the layer into a flat, raster image.
 */
export async function rasterizeLayer(layer: Layer, type: RasterizeType) {
    await executeInPhotoshop(rasterizeLayer, async () => {
        layer.rasterize(type);
    });
}

/**
 * Scales the layer.
 * ```javascript
 * await scaleLayer(layer,80, 80)
 *
 * // Scale the layer to be a quarter of the size relative to bottom left corner
 * import { AnchorPosition } from 'photoshop/dom/Constants';
 * await scalerLayer(layer, 50, 50, AnchorPosition.BOTTOMLEFT)
 * ```
 * @param layer
 * @param width Numeric percentage to scale layer horizontally
 * @param height Numeric percentage to scale layer vertically
 * @param anchor Anchor position to rotate around
 * @param options.interpolation Interpolation method to use when resampling the image
 */
export async function scaleLayer(
    layer: Layer,
    width: number,
    height: number,
    anchor?: AnchorPosition,
    options?: { interpolation?: ResampleMethod }
) {
    await executeInPhotoshop(scaleLayer, async () => {
        await layer.scale(width, height, anchor, options);
    });
}

export async function scaleAndFitLayerToCanvas(layer: Layer) {
    return await executeInPhotoshop(scaleAndFitLayerToCanvas, async () => {
        await scaleLayerToCanvas(layer);
        await fitLayerPositionToCanvas(layer);
    });
}

export async function scaleLayerToCanvas(layer: Layer) {
    await executeInPhotoshop(scaleLayer, async () => {
        let widthScale = getWidthScale(
            layer.bounds.width,
            layer.document.width
        );
        let heightScale = getHeightScale(
            layer.bounds.height,
            layer.document.height
        );

        try {
            await layer.scale(
                widthScale,
                heightScale,
                photoshop.constants.AnchorPosition.MIDDLECENTER
            );
        } catch (e) {
            console.error(e);
        }
    });
}

export async function fitLayerPositionToCanvas(layer: Layer) {
    return await translateLayer(layer, -layer.bounds.left, -layer.bounds.top);
}

/**
 * Moves the layer (translation).
 * ```javascript
 * // Translate the layer to the left by 200px
 * await translateLayer(layer, -200, 0)
 *
 * // move the layer one height down
 * let xOffsetPct = {_unit: "percentUnit", _value: 0};
 * let yOffsetPct = {_unit: "percentUnit", _value: 100};
 * await translateLayer(layer, xOffsetPct, yOffsetPct);
 * ```
 * @param horizontal Numeric value to offset layer by in pixels or percent
 * @param vertical Numeric value to offset layer by in pixels or percent
 */
export async function translateLayer(
    layer: Layer,
    horizontal: number | PercentValue | PixelValue,
    vertical: number | PercentValue | PixelValue
) {
    await executeInPhotoshop(translateLayer, async () => {
        layer.translate(horizontal, vertical);
    });
}

export async function convertLayerToSmartObject(layer: Layer) {
    let command = { _obj: 'newPlacedLayer' };
    return await executeInPhotoshop(convertLayerToSmartObject, async () => {
        layer.selected = true;
        await bp([command], {});
        let newLayer = getNewestLayer(photoshop.app.activeDocument.layers);
        newLayer.selected = false;
        return newLayer;
    });
}

/**
 * Creates a new layer given the new layer's name
 * @param layerName
 * @returns
 */
export async function createNewLayer(layerName: string) {
    try {
        return (await executeInPhotoshop(createNewLayer, async () => {
            if (photoshop.app.activeDocument) {
                let newLayer: Layer =
                    await photoshop.app.activeDocument.layers.add();

                if (layerName) {
                    newLayer.name = layerName;
                }
                return newLayer;
            }
        })) as Layer;
    } catch (e) {}
}

/**
 * Checks if the layer has a mask.
 * @param layer
 * @returns
 */
export async function hasMask(layer: Layer) {
    return await executeInPhotoshop(hasMask, async () => {
        var lm = true,
            pmd;
        try {
            pmd = layer.layerMaskDensity;
            layer.layerMaskDensity = 50.0;
            layer.layerMaskDensity = pmd;
        } catch (e) {
            lm = false;
        }
        return lm;
    });
}

export async function applyMask(layer: Layer) {
    await selectLayerMask(layer);
    return await executeInPhotoshop(applyMask, async () => {
        let command = {
            _obj: 'delete',
            _target: [
                { _enum: 'ordinal', _ref: 'channel', _value: 'targetEnum' },
            ],
            apply: true,
        };
        return await bp([command], {});
    });
}

export async function createMaskFromLayerForLayer(
    fromLayer: Layer,
    forLayer: Layer
) {
    return await executeInPhotoshop(createMaskFromLayerForLayer, async () => {
        let command = {
            _obj: 'make',
            at: { _enum: 'channel', _ref: 'channel', _value: 'mask' },
            duplicate: true,
            new: { _class: 'channel' },
            using: {
                _ref: [
                    {
                        _enum: 'channel',
                        _ref: 'channel',
                        _value: 'transparencyEnum',
                    },
                    { _id: fromLayer.id, _ref: 'layer' },
                ],
            },
        };
        return await bp([command], {});
    });
}

export async function selectLayer(layer: Layer) {
    return await executeInPhotoshop(selectLayer, async () => {
        layer.selected = true;
    });
}

export async function deSelectLayer(layer: Layer) {
    return await executeInPhotoshop(deSelectLayer, async () => {
        layer.selected = false;
    });
}

export async function createTempLayers(
    layerContexts: LayerAIContext[],
    saveContextToStore: Function
) {
    try {
        let finishedContexts = [];
        for (let context of layerContexts) {
            let duplicatedLayer = await context.duplicateCurrentLayer();
            context.tempLayer = duplicatedLayer;
            finishedContexts.push(context);
            context.isGenerating = true;
            saveContextToStore(context);
        }
        return finishedContexts;
    } catch (e) {
        console.error(e);
    }
}

export async function regenerateLayer(
    layerContext: LayerAIContext,
    saveContextToStore: Function,
    getContextFromStore: Function
) {
    try {
        await regenLayers(
            [layerContext],
            saveContextToStore,
            getContextFromStore
        );
    } catch (e) {
        console.error(e);
    }
}

async function regenLayer(layerContext: LayerAIContext) {
    try {
        if (!layerContext.currentLayer?.visible) {
            console.warn(
                `The layer given is currently invisible and will be skipped ${layerContext.currentLayer.name}`
            );
            return;
        }

        if (await layerContext.hasLayerMask()) {
            await applyMask(layerContext.tempLayer);
        }
        let newLayer = await generateAILayer(layerContext);
        return newLayer;
    } catch (e) {
        console.error(e);
    }
}

export async function regenLayers(
    contexts: Array<LayerAIContext>,
    saveContextToStore: Function,
    getContextFromStore: Function
) {
    let contextsToGenerateFrom = contexts.filter((context) => {
        return context.currentLayer?.visible;
    });
    let newContexts = await createTempLayers(
        contextsToGenerateFrom,
        saveContextToStore
    );
    let isLayerSaving = false;
    let prevLayerName = '';
    const tasks = newContexts.map(async (context) => {
        let layer = context.currentLayer;
        while (isLayerSaving) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        let copyOfcontext = context.copy();
        copyOfcontext.isGenerating = true;
        saveContextToStore(copyOfcontext);
        if (prevLayerName !== layer.name) {
            isLayerSaving = true;
            await saveLayerToPluginData(
                createLayerFileName(layer.name, false),
                layer
            );
            isLayerSaving = false;
            prevLayerName = layer.name;
        }

        let newLayer = regenLayer(context);
        await cleanUpRegenLayer(newLayer, copyOfcontext, saveContextToStore);
    });

    await Promise.all(tasks);
}

export async function cleanUpRegenLayer(
    newLayerPromise: Promise<Layer>,
    context: LayerAIContext,
    saveContextToStore?: Function
) {
    let newLayer = await newLayerPromise;
    await moveLayerToTop(newLayer);
    // await scaleAndFitLayerToCanvas(newLayer);
    if (context.tempLayer) {
        await createMaskFromLayerForLayer(context.tempLayer, newLayer);
        // let newerLayer = await newLayer.duplicate();
        // await applyMask(newLayer);
        await deleteLayer(context.tempLayer);
    }

    let copyOfcontext = context.copy();
    copyOfcontext.isGenerating = false;
    saveContextToStore(copyOfcontext);
}
