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
        this.id = this.createID();
        this.prompt = prompt;
        this.categories = categories;
        this.moods = moods;
        this.artists = artists;
        this.src = src;
        this.name = name;
    }

    public generateStylePrompt(): string {
        let prompt = this.prompt;
        if (this.categories.length > 0) {
            prompt += `. With styles like ${this.categories.join(', ')}`;
        }
        if (this.moods.length > 0) {
            prompt += ` With moods like ${this.moods.join(', ')}`;
        }
        if (this.artists.length > 0) {
            prompt += `By the artists ${this.artists.join(', ')}`;
        }
        return prompt;
    }
}
