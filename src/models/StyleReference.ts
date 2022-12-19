import { getContextInfoFromFileName } from 'utils/context_utils';
import { storage } from 'uxp';
import _ from 'lodash';

export default class StyleReference {
    id: string;
    prompt: string;
    name: string;
    categories: string[];
    moods: string[];
    artists: string[];
    src: string;

    constructor(
        prompt: string,
        name: string,
        src: string,
        categories: string[],
        moods: string[],
        artists: string[]
    ) {
        this.id = _.uniqueId();
        this.prompt = prompt;
        this.categories = categories;
        this.moods = moods;
        this.artists = artists;
        this.src = src;
        this.name = name;
    }

    public copy(): StyleReference {
        return _.cloneDeep(this);
    }
}
