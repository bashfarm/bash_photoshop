import { randomlyPickLayerName, validLayerNames } from './general_utils';

describe('randomlyPickLayerName', () => {
    it('should return the context info for history_24_2.png', () => {
        const newName = randomlyPickLayerName();
        expect(validLayerNames).toContain(newName);
    });
});
