import {
    getContextInfoFromFileName,
    getLatestContextHistoryFileInfo,
} from './context_utils';

describe('getContextInfoFromFileName', () => {
    it('should return the context info for history_24_2.png', () => {
        let fName = 'history_24_2.png';
        const { fileFlag, fileNumber, layerContextId } =
            getContextInfoFromFileName(fName);
        expect(fileFlag).toEqual('history');
        expect(layerContextId).toEqual(24);
        expect(fileNumber).toEqual(2);
    });
});

describe('getLatestContextHistoryFileInfo', () => {
    it('should return the context info for history_24_2.png', () => {
        let fName = ['history_24_1.png', 'history_24_2.png'];
        const { fileFlag, fileNumber, layerContextId } =
            getLatestContextHistoryFileInfo(fName);
        expect(fileFlag).toEqual('history');
        expect(layerContextId).toEqual(24);
        expect(fileNumber).toEqual(2);
    });
});
