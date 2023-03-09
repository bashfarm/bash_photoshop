import photoshop from 'photoshop';

export function getPhotoshopLayerFromName(layerName: string) {
    photoshop.app.activeDocument?.layers?.filter(
        (layer) => layerName == layer.name
    )[0];
}

export function getPSLayerByID(layerID: number) {
    return photoshop.app.activeDocument?.layers?.filter(
        (layer) => layerID == layer.id
    )[0];
}
