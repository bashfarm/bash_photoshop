const photoshop = require('photoshop');
const bp = photoshop.action.batchPlay;
import LayerAIContext from 'models/LayerAIContext';
import { PhotoshopTool } from '../constants';
import { createLayerMask, selectLayerMask } from './layer_service';
import { executeInPhotoshop } from './middleware/photoshop_middleware';

/**
 * Selects a tool given the tool enum value.
 * @param {string} toolStr a tool string given the enums from photoshop tool constants
 */
export async function selectTool(toolStr: string) {
    await executeInPhotoshop(selectTool, async () => {
        await bp([{ _obj: 'select', _target: [{ _ref: toolStr }] }], {
            commandName: 'Select Tool',
        });
    });
}

/**
 * Set the brush tool.
 */
export async function setBrushTool() {
    await selectTool(PhotoshopTool.PAINTBRUSHTOOL);
}

// https://stackoverflow.com/questions/29109677/photoshop-javascript-how-to-get-set-current-tool
// Tool names (use quoted strings, e.g. 'moveTool')

/**
 * Toggle on the hiding tool.  What this really means it just creates a layer mask for the first layer
 * of the context and sets the brush color black to hide.
 * @param {LayerAIContext} layerContext
 */
export async function toggleOnContextHidingTool(layerContext: LayerAIContext) {
    let primaryLayer = layerContext.currentLayer;
    await createLayerMask(primaryLayer);
    await selectLayerMask(primaryLayer);
    await setBrushTool();
    const black = new photoshop.app.SolidColor();
    black.rgb.red = 0;
    black.rgb.green = 0;
    black.rgb.blue = 0;
    await executeInPhotoshop(toggleOnContextHidingTool, () => {
        photoshop.app.foregroundColor = black;
    });
}

/**
 * Toggle on the hiding tool.  What this really means it just creates a layer mask for the first layer
 * of the context and sets the brush color white to unhide.
 * @param {LayerAIContext} layerContext
 */
export async function toggleOffContextHidingTool(layerContext: LayerAIContext) {
    let primaryLayer = layerContext.currentLayer;
    await createLayerMask(primaryLayer);
    await selectLayerMask(primaryLayer);
    await setBrushTool();
    const white = new photoshop.app.SolidColor();
    white.rgb.red = 255;
    white.rgb.green = 255;
    white.rgb.blue = 255;
    await executeInPhotoshop(toggleOffContextHidingTool, () => {
        photoshop.app.foregroundColor = white;
    });
}
