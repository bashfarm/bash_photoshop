import LayerAIContext from 'models/LayerAIContext';
import { ContextHistoryEnum } from '../constants';
import { getContextInfoFromFileName } from '../utils/context_utils';

import { getPluginDataFiles } from './io_service';

/**
 * This is meant to get all the files that have been created from the layerContext.  If you don't know what a Layer context is,
 * Check this documentation out
 * @param {Object} layerContext
 * @returns {Promise<Array>}
 */

export async function getContextFileEntries(
    layerContext: LayerAIContext,
    layerFileContextEnum: ContextHistoryEnum
) {
    try {
        let entries = await getPluginDataFiles();
        const theContextsFiles = entries.filter((entry) => {
            let contextInfo = getContextInfoFromFileName(entry.name);
            if (!contextInfo) {
                return false;
            }
            let { fileFlag, layerContextId } = contextInfo;

            return (
                entry.isFile &&
                fileFlag == layerFileContextEnum &&
                layerContext.id == layerContextId
            );
        });

        return theContextsFiles;
    } catch (e) {
        console.error(e);
    }
}
