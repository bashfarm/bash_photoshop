import { ContextType } from 'bashConstants';
import photoshop from 'photoshop';
import React, { FC, useEffect, useRef, useState } from 'react';
import Progressbar from 'react-uxp-spectrum/dist/Progressbar';
import { generateAILayer } from 'services/ai_service';
import {
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
    const [isHovered, setIsHovered] = useState(false);

    const layerContext = getContextFromStore(
        props.contextId,
        ContextType.LAYER
    );

    let animationRef = useRef<HTMLDivElement>(null);
    let [animation, setAnimationTimeline] = useState<gsap.core.Timeline>(null);

    async function regenerateLayer(
        deleteOldLayer: boolean = false,
        contextID: string
    ) {
        let duplicatedLayer = null;

        try {
            const layerContext = getContextFromStore(
                contextID,
                ContextType.LAYER
            );
            const oldLayer = layerContext.currentLayer;
            let copyOfContext = layerContext.copy();
            let newLayercontext = getContextFromStore(
                contextID,
                ContextType.LAYER
            );
            let copyOfNewContext = newLayercontext.copy();
            copyOfNewContext.isGenerating = true;
            saveContextToStore(copyOfNewContext);
            if (await layerContext.hasLayerMask()) {
                duplicatedLayer = await layerContext.duplicateCurrentLayer();
                copyOfContext.currentLayerName = duplicatedLayer.name;
                await copyOfContext.applyLayerMask();
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

            if (deleteOldLayer) {
                await deleteLayer(oldLayer);
            }
            await scaleAndFitLayerToCanvas(newLayer);

            if (duplicatedLayer) {
                await createMaskFromLayerForLayer(duplicatedLayer, newLayer);
                await deleteLayer(duplicatedLayer);
            }

            props.newLayerDTOSelectionFunc(newLayer.name);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleButtonClick() {
        await regenerateLayer(false, props.contextId);
    }

    return (
        <div
            className="flex items-center mr-1 cursor-pointer"
            onClick={handleButtonClick}
        >
            {/* I don't know why the logic is backwards here. */}
            {!getContextFromStore(props.contextId, ContextType.LAYER)
                .isGenerating ? (
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
