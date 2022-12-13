import photoshop from 'photoshop';

const executeAsModal = photoshop.core.executeAsModal;

let suspensionID: number = null;
let caller: Function = null;
let isExecuting: boolean = false;

/**
 * @callback photoshopCallback
 */

/**
 * @param {photoshopCallback} callback - function applied against elements
 * @return {*} anything the callback was supposed to return
 */
export async function executeInPhotoshop(func: Function): Promise<any> {
    try {
        startExecution(func);

        let result = await executeAsModal(
            async (executionContext: any) => {
                let hostControl = executionContext.hostControl;

                // this can probably be move outside of executeAsModal and since we will always be in the modal state.  I dunno...
                // this is working though.
                if (isExecuting && caller != null) {
                    try {
                        suspensionID = await hostControl.suspendHistory({
                            documentID: photoshop.app.activeDocument?.id,
                            name: 'History',
                        });
                    } catch (e) {
                        console.warn(
                            'tried changing the state when it is already changed 😅😅. ignore!'
                        );
                    }
                }

                // console.log(func)
                let result = await func();
                stopExecution(func);

                // We are going to have to rerun this function after we do a lock
                if (!isExecuting) {
                    await hostControl.resumeHistory(suspensionID);
                    suspensionID = null;
                }
                return result;
            },
            {
                commandName: '',
            }
        );

        return result;
    } catch (e) {
        console.error(e);
    }
}

/**
 * We use this at the beginning of execution on the photoshop state.  Every other function that modifies the state
 * will also be calling this.  So lets make it to where only the original can set the global state.
 * @param func
 */
function stopExecution(func: Function) {
    // only the first caller can turn off the execution
    if (caller === func) {
        isExecuting = false;
        caller = null;
    }
}

function startExecution(func: Function) {
    // only if the caller is null will we set a new caller
    if (caller == null) {
        caller = func;
        isExecuting = true;
    }
}
