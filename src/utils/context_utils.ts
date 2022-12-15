import LayerAIContext from 'models/LayerAIContext';
import { Layer } from 'photoshop/dom/Layer';
import { ContextHistoryEnum } from '../constants';

/**
 * Convenenience function to retrieve the file meta data
 * @param {string} fname
 * @returns
 */
export function getContextInfoFromFileName(fname: string) {
    let splitFName = fname.split('_');
    let fileFlag = splitFName[0];
    let layerContextId = parseInt(splitFName[1]);
    let fileNumber = parseInt(splitFName.splice(-1)[0].split('.')[0]);
    if (layerContextId) {
        return { fileFlag, layerContextId, fileNumber };
    }
}

/**
 * From a list of standardized file names determine which one is the latest and return its metadata.
 * @param {Array<string>} fileNames
 * @returns
 */
export function getLatestContextHistoryFileInfo(fileNames: Array<string>) {
    try {
        if (fileNames.length == 0) {
            console.warn(
                'attempted to find context info from files that do not exist.  This happens when a context does not have any files to begin with.'
            );
            return;
        }

        let latestFileInfo = getContextInfoFromFileName(
            fileNames.reduce((latestfName, fName) => {
                let possibleLatestInfo = getContextInfoFromFileName(fName);
                let currentLatestInfo = getContextInfoFromFileName(latestfName);
                return possibleLatestInfo.fileNumber >
                    currentLatestInfo.fileNumber
                    ? fName
                    : latestfName;
            })
        );

        if (latestFileInfo) {
            console.log(latestFileInfo);
            let { fileFlag, layerContextId, fileNumber } = latestFileInfo;
            return { fileFlag, layerContextId, fileNumber };
        }
    } catch (e) {
        console.error(e);
    }
}

/**
 * The file number can only go up to 5.  Only 5 files will be allowed for history
 * @param {Number} contextId
 * @param {Number} fileNumber
 * @returns
 */
export function createContextHistoryFileName(
    contextId: Number,
    fileNumber: Number
) {
    return `${ContextHistoryEnum.HISTORY_FILE_FLAG}_${contextId}_${fileNumber}.png`;
}

export function createAILayerContextId(layer: Layer) {
    return parseInt(`${layer.id}${layer.document.id}`);
}
