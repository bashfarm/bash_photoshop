import photoshop from 'photoshop';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Checkbox, Label } from 'react-uxp-spectrum';
import Progressbar from 'react-uxp-spectrum/dist/Progressbar';
import { generateAILayer } from 'services/ai_service';
import {
    applyMask,
    createMaskFromLayerForLayer,
    deleteLayer,
    moveLayer,
    regenerateLayer,
    scaleAndFitLayerToCanvas,
} from 'services/layer_service';
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

    const layerContext = getContextFromStore(props.contextId);

    async function regenLayer(contextID: string) {
        try {
			let context = getContextFromStore(contextID)
			let copyOfContext = context.copy();
			copyOfContext.isGenerating = true;
			saveContextToStore(copyOfContext);
            let newLayerName = await regenerateLayer(copyOfContext);
			copyOfContext.isGenerating = false;

			saveContextToStore(copyOfContext)

            props.newLayerDTOSelectionFunc(newLayerName);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div
            className="flex items-center mr-1 cursor-pointer"
            onClick={async () => {await regenLayer(props.contextId)}}
        >
            {!getContextFromStore(props.contextId).isGenerating ? (
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
