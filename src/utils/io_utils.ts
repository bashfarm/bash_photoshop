import { B64_IMAGE_HEADER } from '../constants';

/**
 *
 * @param {String} b64imgStr the base64encoded string that will need to be unformatted for images
 * @returns Unformatted base64 encoded string
 */
export function unformatBase64Image(b64imgStr: string): string {
    if (b64imgStr.includes('data:image'))
        return b64imgStr.replace(B64_IMAGE_HEADER, '');
    return b64imgStr;
}

/**
 *
 * @param {String} b64imgStr the base64encoded string that will need to be formatted
 * @returns Formatted base64 encoded string
 */
export function formatBase64Image(b64imgStr: string): string {
    console.log(b64imgStr);
    if (!b64imgStr.includes('data:image')) return B64_IMAGE_HEADER + b64imgStr;
    return b64imgStr;
}
