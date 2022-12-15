import { getContextInfoFromFileName } from 'utils/context_utils';
import { storage } from 'uxp';

export default class LayerAIContextHistory {
    prompt: string;
    fileEntry: storage.File;
    fileNumber: number;
    fileContextId: string;
    fileFlag: string; // should be an enum at some point form constants

    constructor(fileEntry: storage.File) {
        let contextInfo = getContextInfoFromFileName(fileEntry.name);
        this.fileNumber = contextInfo.fileNumber;
        this.fileContextId = contextInfo.layerContextId;
        this.fileFlag = contextInfo.fileFlag;
    }
}
