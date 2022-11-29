const photoshop = require('photoshop');
const executeAsModal = photoshop.core.executeAsModal;
const bp = photoshop.action.batchPlay;
import {
    CreateTopLayerMask,
    GetTopLayer,
    selectLayerMask,
} from './layer_service';

export class PhotoshopTool {
    static MOVETOOL = 'moveTool';
    static MARQUEERECTTOOL = 'marqueeRectTool';
    static MARQUEEELLIPTOOL = 'marqueeEllipTool';
    static MARQUEESINGLEROWTOOL = 'marqueeSingleRowTool';
    static MARQUEESINGLECOLUMNTOOL = 'marqueeSingleColumnTool';
    static LASSOTOOL = 'lassoTool';
    static POLYSELTOOL = 'polySelTool';
    static MAGNETICLASSOTOOL = 'magneticLassoTool';
    static QUICKSELECTTOOL = 'quickSelectTool';
    static MAGICWANDTOOL = 'magicWandTool';
    static CROPTOOL = 'cropTool';
    static SLICETOOL = 'sliceTool';
    static SLICESELECTTOOL = 'sliceSelectTool';
    static SPOTHEALINGBRUSHTOOL = 'spotHealingBrushTool';
    static MAGICSTAMPTOOL = 'magicStampTool';
    static PATCHSELECTION = 'patchSelection';
    static REDEYETOOL = 'redEyeTool';
    static PAINTBRUSHTOOL = 'paintbrushTool';
    static PENCILTOOL = 'pencilTool';
    static COLORREPLACEMENTBRUSHTOOL = 'colorReplacementBrushTool';
    static CLONESTAMPTOOL = 'cloneStampTool';
    static PATTERNSTAMPTOOL = 'patternStampTool';
    static HISTORYBRUSHTOOL = 'historyBrushTool';
    static ARTBRUSHTOOL = 'artBrushTool';
    static ERASERTOOL = 'eraserTool';
    static BACKGROUNDERASERTOOL = 'backgroundEraserTool';
    static MAGICERASERTOOL = 'magicEraserTool';
    static GRADIENTTOOL = 'gradientTool';
    static BUCKETTOOL = 'bucketTool';
    static BLURTOOL = 'blurTool';
    static SHARPENTOOL = 'sharpenTool';
    static SMUDGETOOL = 'smudgeTool';
    static DODGETOOL = 'dodgeTool';
    static BURNINTOOL = 'burnInTool';
    static SATURATIONTOOL = 'saturationTool';
    static PENTOOL = 'penTool';
    static FREEFORMPENTOOL = 'freeformPenTool';
    static ADDKNOTTOOL = 'addKnotTool';
    static DELETEKNOTTOOL = 'deleteKnotTool';
    static CONVERTKNOTTOOL = 'convertKnotTool';
    static TYPECREATEOREDITTOOL = 'typeCreateOrEditTool';
    static TYPEVERTICALCREATEOREDITTOOL = 'typeVerticalCreateOrEditTool';
    static TYPECREATEMASKTOOL = 'typeCreateMaskTool';
    static TYPEVERTICALCREATEMASKTOOL = 'typeVerticalCreateMaskTool';
    static PATHCOMPONENTSELECTTOOL = 'pathComponentSelectTool';
    static DIRECTSELECTTOOL = 'directSelectTool';
    static RECTANGLETOOL = 'rectangleTool';
    static ROUNDEDRECTANGLETOOL = 'roundedRectangleTool';
    static ELLIPSETOOL = 'ellipseTool';
    static POLYGONTOOL = 'polygonTool';
    static LINETOOL = 'lineTool';
    static CUSTOMSHAPETOOL = 'customShapeTool';
    static TEXTANNOTTOOL = 'textAnnotTool';
    static SOUNDANNOTTOOL = 'soundAnnotTool';
    static EYEDROPPERTOOL = 'eyedropperTool';
    static COLORSAMPLERTOOL = 'colorSamplerTool';
    static RULERTOOL = 'rulerTool';
    static HANDTOOL = 'handTool';
    static ZOOMTOOL = 'zoomTool';
}

export async function SelectTool(toolStr) {
    await executeAsModal(async () => {
        await bp([{ _obj: 'select', _target: [{ _ref: toolStr }] }], {
            commandName: 'Select Tool',
        });
    });
}

export async function SetBrushTool() {
    await SelectTool(PhotoshopTool.PAINTBRUSHTOOL);
}

// https://stackoverflow.com/questions/29109677/photoshop-javascript-how-to-get-set-current-tool
// Tool names (use quoted strings, e.g. 'moveTool')

export async function HidingTool() {
    console.log('Hide Tool Enabled!');
    try {
        await CreateTopLayerMask();
        await selectLayerMask(GetTopLayer());
        await SetBrushTool();
        const black = new photoshop.app.SolidColor();
        black.rgb.red = 0;
        black.rgb.green = 0;
        black.rgb.blue = 0;
        await executeAsModal(() => {
            photoshop.app.foregroundColor = black;
        });
    } catch (e) {
        console.error(e);
    }
}

export async function UnHidingTool() {
    console.log('Hide Tool Enabled!');
    try {
        await CreateTopLayerMask();
        await selectLayerMask(GetTopLayer());
        await SetBrushTool();
        const white = new photoshop.app.SolidColor();
        white.rgb.red = 255;
        white.rgb.green = 255;
        white.rgb.blue = 255;
        await executeAsModal(() => {
            photoshop.app.foregroundColor = white;
        });
    } catch (e) {
        console.error(e);
    }
}
