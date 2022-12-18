/**
 * formats base64 image string to be used in the API, by attaching a header to the base64 string
 * @param {string} b64imgStr, base64 image string
 * @returns
 */
export const formatBase64Image = (b64imgStr: string): string => {
    const b64header = 'data:image/png;base64, ';
    if (!b64imgStr.includes('data:image')) return b64header + b64imgStr;
    return b64imgStr;
};

/**
 *
 * @returns unformats base64 string
 */
export function unformatBase64Image(b64imgStr: string): string {
    const b64header = 'data:image/png;base64, ';
    if (b64imgStr.includes('data:image'))
        return b64imgStr.replace(b64header, '');
    return b64imgStr;
}
