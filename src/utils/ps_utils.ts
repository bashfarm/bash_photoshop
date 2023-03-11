import photoshop from 'photoshop';

export function getPhotoshopLayerFromName(layerName: string) {
    return photoshop.app.activeDocument?.layers?.filter(
        (layer) => layerName.toLowerCase() == layer.name.toLowerCase()
    )[0];
}
