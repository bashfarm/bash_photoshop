import React, { FC, useEffect, useState } from 'react';
import { regenerateLayer } from 'services/layer_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';

type RegenerationToolProps = {
    icon?: FC<any>;
    label?: string;
    contextId: string;
};

export default function RegenerationTool(props: RegenerationToolProps) {
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    const saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    useEffect(() => {}, [getContextFromStore(props.contextId)]);

    return (
        <div
            className="flex items-center mr-1 cursor-pointer"
            onClick={async () => {
                {
                    await regenerateLayer(
                        getContextFromStore(props.contextId),
                        saveContextToStore,
                        getContextFromStore
                    );
                }
            }}
        >
            <div>
                <props.icon
                    {...{
                        fontSize: 'small',
                        style: { color: 'var(--uxp-host-text-color)' },
                    }}
                />
                {!getContextFromStore(props.contextId).isGenerating ? (
                    <span
                        className={`ml-1 whitespace-nowrap`}
                        style={{
                            color: 'var(--uxp-host-label-text-color)',
                        }}
                    >
                        {props.label}
                    </span>
                ) : (
                    <>
                        <h1
                            className={`ml-1 inline-block font-bold text-xl `}
                            style={{
                                color: '#71f79f',
                            }}
                        >
                            Generating
                        </h1>
                        <h1
                            className={`ml-1 inline-block font-bold `}
                            style={{
                                color: '#7e4dfb',
                            }}
                        >
                            ...
                        </h1>
                    </>
                )}
            </div>
        </div>
    );
}
