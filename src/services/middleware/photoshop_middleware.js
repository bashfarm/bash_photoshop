const photoshop = require('photoshop');
const executeAsModal = photoshop.core.executeAsModal;

/**
 * @callback photoshopCallback
 */

/**
 * @param {photoshopCallback} callback - function applied against elements
 * @return {*} anything the callback was supposed to return
 */
export async function executeInPhotoshop(func) {
    try {
        return await executeAsModal(async () => {
            return await func();
        });
    } catch (e) {
        console.error(e);
    }
}
