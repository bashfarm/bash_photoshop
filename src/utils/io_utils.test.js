import { B64_IMAGE_HEADER } from '../bashConstants';
import { formatBase64Image, unformatBase64Image } from './io_utils';

describe('formatBase64Image', () => {
    it('should not put the b64 image header on the string', () => {
        let expectation = B64_IMAGE_HEADER + 'yolo';
        const stringWithHeader = formatBase64Image(expectation);
        const stringWithoutHeader = formatBase64Image('yolo');
        expect(stringWithHeader).toEqual(expectation);
        expect(stringWithoutHeader).toEqual(expectation);
    });
});

describe('unformatBase64Image', () => {
    it('should remove the b64 image header on the string', () => {
        let expectation = 'yolo';
        const stringWithoutHeader = unformatBase64Image(expectation);
        const stringWithHeader = unformatBase64Image(B64_IMAGE_HEADER + 'yolo');
        expect(stringWithHeader).toEqual(expectation);
        expect(stringWithoutHeader).toEqual(expectation);
    });
});
