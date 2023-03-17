import React, { FC, useEffect, useState } from 'react';
import { regenerateLayer } from 'services/layer_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';

type RegenerationToolProps = {
    icon?: FC<any>;
    label?: string;
    contextId: string;
    newLayerDTOSelectionFunc: Function;
};

export default function RegenerationTool(props: RegenerationToolProps) {
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    const saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    let layerContext = getContextFromStore(props.contextId);

    return (
        <div
            className="flex items-center mr-1 cursor-pointer"
            onClick={async () => {
                {
                    let copyOfContext = getContextFromStore(
                        props.contextId
                    ).copy();
                    copyOfContext.isGenerating = true;
                    saveContextToStore(copyOfContext);
                    await regenerateLayer(
                        layerContext,
                        saveContextToStore,
                        getContextFromStore
                    );
                    copyOfContext = getContextFromStore(props.contextId).copy();
                    copyOfContext.isGenerating = false;
                    saveContextToStore(copyOfContext);
                }
            }}
        >
            {!getContextFromStore(props.contextId)?.isGenerating ? (
                <div>
                    <props.icon
                        {...{
                            fontSize: 'small',
                            style: { color: 'var(--uxp-host-text-color)' },
                        }}
                    />

                    <span
                        className={`ml-1 mr-10 whitespace-nowrap`}
                        style={{
                            color: 'var(--uxp-host-label-text-color)',
                        }}
                    >
                        {props.label}
                    </span>
                </div>
            ) : (
                <div>
                    <h1
                        className={`inline-block font-bold text-xl `}
                        style={{
                            color: '#71f79f',
                        }}
                    >
                        Generating
                    </h1>
                    <h1
                        className={`inline-block font-bold text-xl `}
                        style={{
                            color: '#7e4dfb',
                        }}
                    >
                        ...
                    </h1>
                </div>
            )}
        </div>
    );
}
