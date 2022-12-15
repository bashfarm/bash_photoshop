import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import LayerAIContext from 'models/LayerAIContext';

/**
 * Currently Not working!
 * @returns
 */
export const ContextRecycleBin = () => {
    let contextCache = useContextStore(
        (state: ContextStoreState) => state.contextCache
    );
    const layerAssignments = useContextStore(
        (state: ContextStoreState) => state.layerAssignments
    );

    console.log(contextCache);

    return (
        <>
            {Object.keys(contextCache)?.map((key) => {
                let deattachedContext = contextCache[
                    parseInt(key)
                ] as LayerAIContext;
                console.log("not sure why this isn't rerendered");

                return (
                    <>
                        <div>{deattachedContext.id}</div>
                    </>
                );
            })}
        </>
    );
};
