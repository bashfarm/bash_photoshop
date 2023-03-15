import { randomlyPickLayerName } from '../utils/general_utils';
import { getDataFolderEntry } from './io_service';
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
 * Selects all the visible layers and returns a list of the selected layers
 * @returns {Array}
 */
async function selectAllVisibleLayers(): Promise<Layer[]> {
	await executeInPhotoshop(selectAllVisibleLayers, async () => {
		getVisibleLayers(app.activeDocument.layers).forEach((layer) => {
			layer.selected = true;
		});
	});

	return getSelectedLayers(app.activeDocument.layers);
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
	if (selected) return getSelectedLayers(app.activeDocument.layers)[0];

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
		console.error("Moving Layer to Top", e);
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
 * Create a newly merged layer given all the visible layers.
 */
export async function createMergedLayer(): Promise<void> {
	await executeInPhotoshop(createMergedLayer, async () => {
		selectAllVisibleLayers();

		const selectedLayers = getSelectedLayers(app.activeDocument.layers);
		selectedLayers.forEach(async (layer) => {
			if (layer.visible) {
				const newLayer = await duplicateLayer(
					layer,
					layer,
					photoshop.constants.ElementPlacement.PLACEBEFORE
				);
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
	await executeInPhotoshop(mergeVisibleLayers, async () => {
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
	await executeInPhotoshop(deselectLayers, () => {
		getSelectedLayers(app.activeDocument.layers).forEach((layer) => {
			layer.selected = false;
		});
	});
}

/**
 * Creates a layer mask to hide and unhide details on the given layer.
 */
export async function createLayerMask(layer: Layer) {
	await executeInPhotoshop(createLayerMask, async () => {
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
 * Flips the layer on one or both axis.
 *
 * ```javascript
 * // flip horizontally
 * await flipLayer(layer, "horizontal")
 * ```
 * @param axis Which axis (or both) to flip the layer on.
 *             - "horizontal": flip layer on horizontal axis
 *             - "vertical": flip layer on vertical axis
 *             - "both": flip layer on both axes
 */
export async function flipLayer(
	layer: Layer,
	axis: 'horizontal' | 'vertical' | 'both'
) {
	await executeInPhotoshop(flipLayer, async () => {
		layer.flip(axis);
	});
}

/**
 * Clears the layer pixels and does not copy to the clipboard. If no pixel selection is found, select all pixels and clear.
 */
export async function clearLayer(layer: Layer) {
	await executeInPhotoshop(clearLayer, async () => {
		layer.clear();
	});
}

/**
 * Copies the layer to the clipboard. When the optional argument is set to true, a merged copy is performed (that is, all visible layers are copied to the clipboard).
 */
export async function copyLayer(layer: Layer, merge: boolean = false) {
	await executeInPhotoshop(copyLayer, async () => {
		layer.copy(merge);
	});
}

/**
 * Moves the layer to a position above the topmost layer or group.
 */
export async function bringLayerToFront(layer: Layer) {
	await executeInPhotoshop(bringLayerToFront, () => {
		layer.bringToFront();
	});
}
/**
 * Moves the layer to the bottom. If the bottom layer is the background, it will move the layer to the position above the background. If it is in a group, it will move to the bottom of the group.
 */
export async function sendLayerToBack(layer: Layer) {
	await executeInPhotoshop(sendLayerToBack, () => {
		layer.sendToBack();
	});
}

/**
 * Creates a link between this layer and the target layer if not already linked,
 * and returns a list of layers linked to this layer.
 * ```javascript
 * // link two layers together
 * const linkedLayers = await linkLayers(strokes, fillLayer)
 * linkedLayers.forEach((layer) => console.debug(layer.name))
 * > "strokes"
 * > "fillLayer"
 * ```
 */
export async function linkLayers(
	originalLayer: Layer,
	targetLayer: Layer
): Promise<Layer[]> {
	return await executeInPhotoshop(linkLayers, async () => {
		return originalLayer.link(targetLayer);
	});
}

/**
 * Unlinks the layer from any existing links.
 */
export async function unlinkLayers(layer: Layer): Promise<Layer[]> {
	return await executeInPhotoshop(unlinkLayers, async () => {
		return layer.unlink();
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
 * Rotates the layer.
```javascript
// rotate 90 deg counter clockwise
await rotateLayer(layer, (-90))

// rotate 90 deg clockwise relative to top left corner
import { AnchorPosition } from 'photoshop/dom/Constants';
await rotatelayer(layer, 90, AnchorPosition.TOPLEFT)
```
 * @param layer 
 * @param angle Angle to rotate the layer by in degrees
 * @param anchor Anchor position to rotate around
 * @param options.interpolation Interpolation method to use when 
 */
export async function rotateLayer(
	layer: Layer,
	angle: number | AngleValue,
	anchor?: AnchorPosition,
	options?: { interpolation?: ResampleMethod }
) {
	await executeInPhotoshop(rotateLayer, async () => {
		layer.rotate(angle, anchor, options);
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
 * Applies a skew to the layer.
 * ```javascript
 * // parellelogram shape
 * await skewLayer(layer, -15, 0)
 * ```
 * @param layer
 * @param angleH Horizontal angle to skew by
 * @param angleV Vertical angle to skew by
 * @param option.interpolation Interpolation method to use when resampling the image
 */
export async function skewLayer(
	layer: Layer,
	angleH: number | AngleValue,
	angleV: number | AngleValue,
	options?: { interpolation?: ResampleMethod }
) {
	await executeInPhotoshop(skewLayer, async () => {
		layer.skew(angleH, angleV, options);
	});
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
	} catch (e) { }
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

// export async function regenerateLayer(layerContext: LayerAIContext, moveToTop: boolean = false) {
// 	try {
// 		const oldLayer = layerContext.currentLayer;

// 		let layerHadMask = await layerContext.hasLayerMask();
// 		let duplicatedLayer = null;
// 		if (layerContext.maintainTransparency) {
// 			duplicatedLayer = await layerContext.duplicateCurrentLayer();
// 			if (layerHadMask) {
// 				applyMask(duplicatedLayer);
// 			}
// 		}
// 		const newLayer = await generateAILayer(layerContext);

// 		if (moveToTop) {
// 			await moveLayerToTop(newLayer);
// 		} else {
// 			await moveLayer(
// 				newLayer,
// 				oldLayer,
// 				photoshop.constants.ElementPlacement.PLACEBEFORE
// 			);
// 		}
// 		await scaleAndFitLayerToCanvas(newLayer);

// 		console.debug('oldLayer', oldLayer.name)
// 		console.debug('newLayer', newLayer.name)
// 		console.debug('duplicatedLayer', duplicatedLayer?.name)
// 		if (duplicatedLayer) {
// 			await createMaskFromLayerForLayer(duplicatedLayer, newLayer);
// 			await applyMask(newLayer);
// 			await deleteLayer(duplicatedLayer);
// 		}
// 		return newLayer.name

// 	} catch (e) {
// 		console.error(e);
// 	}
// }


export async function regenerateLayer(layerContext: LayerAIContext, moveToTop: boolean = false) {
	try {
		const oldLayer = layerContext.tempLayer;

		applyMask(layerContext.tempLayer);
		const newLayer = await generateAILayer(layerContext);

		if (moveToTop) {
			await moveLayerToTop(newLayer);
		} else {
			await moveLayer(
				newLayer,
				oldLayer,
				photoshop.constants.ElementPlacement.PLACEBEFORE
			);
		}
		await scaleAndFitLayerToCanvas(newLayer);

		console.debug('oldLayer', oldLayer.name)
		console.debug('newLayer', newLayer.name)
		console.debug('duplicatedLayer', layerContext.tempLayer?.name)
		await createMaskFromLayerForLayer(layerContext.tempLayer, newLayer);
		await applyMask(newLayer);
		await deleteLayer(layerContext.tempLayer);
		return newLayer.name

	} catch (e) {
		console.error(e);
	}
}



export async function createTempLayers(layerContexts: LayerAIContext[]) {
	try {
		let finishedContexts = [];
		for (let context of layerContexts) {
			let duplicatedLayer = await context.duplicateCurrentLayer();
			context.tempLayer = duplicatedLayer;
			finishedContexts.push(context);
		}
		return finishedContexts;

	} catch (e) {
		console.error(e);
	}
}


export async function regenerateVisibleLayers(layerContexts: LayerAIContext[]) {
	try {
		let newContexts = []
		for (let layerContext of layerContexts) {
			if (!layerContext.currentLayer?.visible) {
				continue;
			}

			let oldLayer = layerContext.currentLayer;

			if (await layerContext.hasLayerMask()) {
				await applyMask(layerContext.tempLayer);
			}
			let duplicatedLayer = await layerContext.duplicateCurrentLayer();
			let newLayerPromise = generateAILayer(layerContext);
			// await moveLayer(
			// 	newLayer,
			// 	oldLayer,
			// 	photoshop.constants.ElementPlacement.PLACEBEFORE
			// );
			let newLayer = await newLayerPromise;
			moveLayerToTop(newLayer)
			console.debug('oldLayer', oldLayer.name)
			console.debug('newLayer', newLayer.name)
			console.debug('duplicatedLayer', duplicatedLayer?.name)
			await scaleAndFitLayerToCanvas(newLayer);
			await createMaskFromLayerForLayer(duplicatedLayer, newLayer);
			await applyMask(newLayer)
			await deleteLayer(duplicatedLayer);
			layerContext.tempLayer = null;
			newContexts.push(layerContext);
		}
		return newContexts
	} catch (e) {
		console.error(e);
	}
}