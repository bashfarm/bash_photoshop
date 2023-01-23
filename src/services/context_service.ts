import LayerAIContext from 'models/LayerAIContext';
import { storage } from 'uxp';
import { ContextHistoryEnum } from '../bashConstants';
import { getContextInfoFromFileName } from '../utils/context_utils';

import { getPluginDataFiles } from './io_service';

/**
 *
 * @param layerContext
 * @param layerFileContextEnum
 * @returns
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

export const getContextHistoryFiles = async (
    layerContext: LayerAIContext
): Promise<storage.File[]> => {
    try {
        return await layerContext.getContextHistoryFileEntries();
    } catch (error) {
        console.error(error);
        throw error;
    }
};
