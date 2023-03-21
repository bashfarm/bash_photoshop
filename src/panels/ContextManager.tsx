import LayerAIContext from 'models/LayerAIContext';
import React, { useEffect } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import ContextItem from '../components/ContextItem/ContextItem';
import { Button, Divider } from 'react-uxp-spectrum';
import { BashfulHeader } from 'components/BashfulHeader';
import ContextToolBar from '../components/ContextManagerToolBar';
import _ from 'lodash';

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
                <BashfulHeader animate={false} />
                <ContextToolBar />
                <div className="mb-1">
                    <Button
                        variant="primary"
                        onClick={async () => {
                            let newContext = await createNewContext();
                            console.log(newContext);
                        }}
                    >
                        Create New AI Setting
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
    let contexts = useContextStore(
        (state: ContextStoreState) => state.layerContexts
    );

    return (
        <>
            {Object.keys(contexts).map((key) => {
                let context = contexts[key];
                return (
                    <>
                        <ContextItem key={context.id} contextID={context.id} />
                        <Divider
                            key={_.uniqueId()}
                            className="my-2"
                            size="small"
                        />
                    </>
                );
            })}
        </>
    );
}
