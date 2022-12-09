import { storage } from 'uxp';

export default interface LayerAIHistory {
    prompt: string;
    fileEntry: storage.File;
    fileNumber: Number;
    fileContextId: Number;
    fileFlag: string; // should be an enum at some point form constants
}
