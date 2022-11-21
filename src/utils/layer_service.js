const photoshop = require('photoshop');
const app = photoshop.app;
const bp = photoshop.action.batchPlay;
const executeAsModal = photoshop.core.executeAsModal;
import { SaveMergedLayersImgPNGToDataFolder } from './io_service';

/**
 * The entry point to the service.  For now...
 * @returns null if there is not more than one visible layer
 */
export async function MergeAndSaveAllVisibleLayersIntoImage() {
    try {
        if (!IsMoreThanOneVisibleLayer()) {
            console.log(
                'Could not merge visible layers as only one was available'
            );
            return;
        }

        const res = await executeAsModal(async () => {
            var visibleLayers = GetVisibleLayers();
            console.log(visibleLayers);
            visibleLayers[0].selected = true;
        });
        await mergeVisibleLyrs();
        await MakeLayersInvisible();
        SaveMergedLayersImgPNGToDataFolder()
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
    const res = await executeAsModal(async () => {
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
}


const PlaceImageFromDataOnLayer = async (imageName) => {
    try {
        const dataFolder = await fs.getDataFolder();
        var placedDocument = await dataFolder.getEntry(imageName);
        if (!placedDocument) return;
        let tkn = fs.createSessionToken(placedDocument);
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