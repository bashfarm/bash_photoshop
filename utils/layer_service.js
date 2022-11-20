const photoshop = require('photoshop');
const app = photoshop.app;
const bp = photoshop.action.batchPlay
const executeAsModal = photoshop.core.executeAsModal;

/**
 * The entry point to the service.  For now...
 * @returns null if there is not more than one visible layer
 */
export async function Main() {
  try {
    if (!IsMoreThanOneVisibleLayer()) {
      console.log("Could not merge visible layers as only one was available");
      return;
    }

;
    const res = await executeAsModal(async () => { 
      GetVisibleLayers()[0].selected = true
    
    })
    await mergeVisibleLyrs()
    await MakeLayersInvisible()
    
    console.log("after exectue")

  } catch (e) {
    console.log(e);
  }
}

/**
 * @returns {Array} the visible layers in the active document
 */
function GetVisibleLayers() {
  var visibleLayers = app.activeDocument.layers.map((layer) => {
    if (layer.visible) return layer;
  });
  console.log("after visible layers")
  return visibleLayers
}

/**
 * Turns all visible layers invisible
 */
async function MakeLayersInvisible() {
  await executeAsModal(async () => { 
    for (var visibleLayer of GetVisibleLayers().slice(1)) visibleLayer.visible = false;
  })
}

/**
 *
 * @returns {Boolean} true if there are more than one visible layers in the active document
 */
function IsMoreThanOneVisibleLayer() {
  return GetVisibleLayers().length > 1;
}

async function mergeVisibleLyrs() {
  const res = await executeAsModal(async () => { 
    await bp([
      {
        _obj: "mergeVisible",
        duplicate: true,
        _options: {
          dialogOptions: "dontDisplay",
        },
      },
    ],{ commandName: "Generate Combined Layers" })
  
  })
  console.log("finished Merging Layers")
}
