import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { useContextStore } from 'store/contextStore';
import ContextItem from './Context/ContextItem';
import { Button, Divider } from 'react-uxp-spectrum';
import { BashfulHeader } from 'components/BashfulHeader';
import ContextToolBar from './ContextManagerToolBar';

export default function ContextManager() {
    const saveContextToStore = useContextStore(
        (state) => state.saveContextToStore
    );

    // TODO: This can also be moved since it's using the store, and the store can be called from anywhere
    async function createNewContext() {
        let context = new LayerAIContext();
        saveContextToStore(context);
        return context;
    }
    try {
        return (
            <>
                <BashfulHeader animate={true} />
                <ContextToolBar />
                <div className="mb-1">
                    <Button
                        variant="primary"
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
    } catch (e) {
        console.error(e);
        return <div>error</div>;
    }
}

/**
 * This creates the actual <ContextItem/>s list to be displayed.  This renders the contexts
 * in the order the layers are found in the document.
 * @returns
 */
// TODO: move to its own file or something else - needs refactoring though
function ContextItems() {
    const contexts = useContextStore((state) => state.contexts);
    const state = useContextStore((state) => state);
    const getContextStore = useContextStore((state) => state.getContextStore);
    console.log('rerender');
    console.log(contexts);
    console.log(state);
    console.log(getContextStore());
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
                            />
                            <Divider className="my-2" size="small" />
                        </>
                    );
                })}
        </>
    );
}
