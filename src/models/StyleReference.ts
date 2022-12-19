import _ from 'lodash';
import { BashfulObject } from './BashfulObject';

export default class StyleReference extends BashfulObject {
    id: string;
    prompt: string;
    name: string;
    categories: string[];
    moods: string[];
    artists: string[];
    src: string;

    constructor(
        prompt: string = '',
        name: string = '',
        src: string = '',
        categories: string[] = [],
        moods: string[] = [],
        artists: string[] = []
    ) {
        super();
        this.id = _.uniqueId();
        this.prompt = prompt;
        this.categories = categories;
        this.moods = moods;
        this.artists = artists;
        this.src = src;
        this.name = name;
    }
}
