import { BashfulObject } from './BashfulObject';

export default class ContextTag extends BashfulObject {
    value: number;
    text: string;

    constructor(
        options: any = {
            value: 0.7,
            text: '',
        }
    ) {
        super();
        this.value = options?.value ?? 0.7;
        this.text = options?.text ?? '';
    }

    public update(tag: ContextTag): boolean {
        let changed = false;
        if (this.value !== tag.value) {
            this.value = tag.value;
            changed = true;
        }
        if (this.text !== tag.text) {
            this.text = tag.text;
            changed = true;
        }

        return changed;
    }

    public getContextualizedText(): string {
        let numIterations = this.getNumIterations();
        let contextualizedText = this.text;

        for (let i = 0; i < numIterations; i++) {
            contextualizedText += `(${contextualizedText})`;
        }
        return contextualizedText;
    }

    private getNumIterations(): number {
        if (this.value < 0.5) {
            return 1;
        } else if (this.value < 0.7) {
            return 2;
        }
        return 3;
    }
}
