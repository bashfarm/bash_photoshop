// import { E2ETestingPanel } from 'components/E2ETestingPanel';
import LayerAIContext from 'models/LayerAIContext';
import React, { useRef, useLayoutEffect, useState } from 'react';
import { useContextStore } from 'store/contextStore';
import { ContextItem } from '../components/ContextItem';
import { Button, Divider } from 'react-uxp-spectrum';
import { BashfulHeader } from 'components/BashfulHeader/index';
import { getSaveAnimationTimeline } from 'utils/animation_utils';

export const ContextManager = () => {
    const saveContextToStore = useContextStore(
        (state) => state.saveContextToStore
    );

    // TODO: This can also be moved since it's using the store, and the store can be called from anywhere
    async function createNewContext() {
        let context = new LayerAIContext();
        saveContextToStore(context);
        return context;
    }

    return (
        <>
            <BashfulHeader animate={true} />
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
    const contexts = useContextStore((state) => state.contexts);
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
