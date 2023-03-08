import { B64_IMAGE_HEADER } from '../bashConstants';
import { addB64Header, removeB64Header } from './io_utils';

describe('formatBase64Image', () => {
    it('should not put the b64 image header on the string', () => {
        let expectation = B64_IMAGE_HEADER + 'yolo';
        const stringWithHeader = addB64Header(expectation);
        const stringWithoutHeader = addB64Header('yolo');
        expect(stringWithHeader).toEqual(expectation);
        expect(stringWithoutHeader).toEqual(expectation);
    });
});

describe('unformatBase64Image', () => {
    it('should remove the b64 image header on the string', () => {
        let expectation = 'yolo';
        const stringWithoutHeader = removeB64Header(expectation);
        const stringWithHeader = removeB64Header(B64_IMAGE_HEADER + 'yolo');
        expect(stringWithHeader).toEqual(expectation);
        expect(stringWithoutHeader).toEqual(expectation);
    });
});
