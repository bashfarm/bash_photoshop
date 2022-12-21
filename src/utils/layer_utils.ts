export function getWidthScale(layerWidth: number, docWidth: number) {
    return getScale(layerWidth, docWidth, true, false);
}

export function getHeightScale(layerHeight: number, docHeight: number) {
    return getScale(layerHeight, docHeight, true, false);
}

export function getScale(
    imageDimSize: number,
    docDimSize: number,
    inHundreds: boolean = false,
    inPixels: boolean = true
) {
    if (inPixels) {
        return docDimSize - imageDimSize;
    }

    if (inHundreds) {
        return (docDimSize / imageDimSize) * 100;
    }
    return docDimSize / imageDimSize;
}
