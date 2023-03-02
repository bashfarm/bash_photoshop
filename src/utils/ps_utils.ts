import photoshop from 'photoshop';

export function getPhotoshopLayerFromName(layerName: string) {
    photoshop.app.activeDocument?.layers?.filter(
        (layer) => layerName == layer.name
    )[0];
}
