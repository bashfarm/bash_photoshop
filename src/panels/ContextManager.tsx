// import { E2ETestingPanel } from 'components/E2ETestingPanel';
import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextItem } from '../components/ContextItem';
import photoshop from 'photoshop';
import { Button, Divider } from 'react-uxp-spectrum';
const app = photoshop.app;

export const ContextManager = () => {
    const saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    // TODO: This can also be moved since it's using the store, and the store can be called from anywhere
    async function createNewContext() {
        let context = new LayerAIContext();
        saveContextToStore(context);
        return context;
    }

    return (
        <>
            {/* <ContextRecycleBin />

			<E2ETestingPanel></E2ETestingPanel> */}

            <div className="mb-1">
                <Button
                    onClick={async () => {
                        let newContext = await createNewContext();
                        console.log(newContext);
                    }}
                >
                    Create New Context
                </Button>
            </div>
            <ContextItems />
        </>
    );
};

/**
 * This creates the actual <ContextItem/>s list to be displayed.  This renders the contexts
 * in the order the layers are found in the document.
 * @returns
 */
// TODO: move to its own file or something else - needs refactoring though
function ContextItems() {
    const contexts = useContextStore(
        (state: ContextStoreState) => state.contexts
    );
    return (
        <>
            {contexts &&
                Object.keys(contexts).map((key) => {
                    let context = contexts[key];
                    return (
                        <>
                            <ContextItem
                                key={context.id}
                                contextID={context.id}
                            ></ContextItem>
                            <Divider className="my-2" size="small" />
                        </>
                    );
                })}
        </>
    );
}
