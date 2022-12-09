/**
 * Convenenience function to retrieve the file meta data
 * @param {*} fname
 * @returns
 */
export function getContextInfoFromFileName(fname) {
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
 * @param {*} fileNames
 * @returns
 */
export function getLatestContextHistoryFileInfo(fileNames) {
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
