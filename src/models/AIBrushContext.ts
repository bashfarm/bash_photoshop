import _ from 'lodash';
import ContextObject from './ContextObject';

export default class AIBrushContext extends ContextObject {
    constructor(
        options: any = {
            currentPrompt: '',
            stylingStrength: 0.7,
            consistencyStrength: 0.1,
            seed: -1,
            negativePrompt: '',
            docType: 'illustration',
        }
    ) {
        super();
        this.currentPrompt = options.currentPrompt;
        this.negativePrompt = options.negativePrompt;
        this.stylingStrength = options.stylingStrength;
        this.consistencyStrength = options.consistencyStrength;
        this.seed = options.seed;
        this.docType = options.docType;
    }
}
