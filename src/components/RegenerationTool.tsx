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

    async function regenerateLayer(contextID: string) {
        try {
            const layerContext = getContextFromStore(contextID);
            const oldLayer = layerContext.currentLayer;
            let copyOfContext = layerContext.copy();
            let newLayercontext = getContextFromStore(contextID);
            let copyOfNewContext = newLayercontext.copy();
            copyOfNewContext.isGenerating = true;
            saveContextToStore(copyOfNewContext);
            let layerHadMask = await layerContext.hasLayerMask();
            let duplicatedLayer = null;
            if (copyOfContext.maintainTransparency) {
                duplicatedLayer = await layerContext.duplicateCurrentLayer();
                if (layerHadMask) {
                    applyMask(duplicatedLayer);
                }
            }
            const newLayer = await generateAILayer(layerContext);
            copyOfContext.isGenerating = false;
            copyOfContext.currentLayerName = newLayer.name;
            saveContextToStore(copyOfContext);

            await moveLayer(
                newLayer,
                oldLayer,
                photoshop.constants.ElementPlacement.PLACEBEFORE
            );

            await scaleAndFitLayerToCanvas(newLayer);

            if (duplicatedLayer) {
                await createMaskFromLayerForLayer(duplicatedLayer, newLayer);
                if (!layerHadMask) {
                    await applyMask(newLayer);
                }
                await deleteLayer(duplicatedLayer);
            }

            props.newLayerDTOSelectionFunc(newLayer.name);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleButtonClick() {
        await regenerateLayer(props.contextId);
    }

    return (
        <div
            className="flex items-center mr-1 cursor-pointer"
            onClick={handleButtonClick}
        >
            {/* I don't know why the logic is backwards here. */}
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
