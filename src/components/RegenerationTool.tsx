import { MAX_IMAGES_GENERATED_WITHIN_TIME_FRAME } from 'bashConstants';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import photoshop from 'photoshop';
import React, { FC, useState } from 'react';
import { regenerateDocument, regenerateLayer } from 'services/layer_service';
import { executeInPhotoshop } from 'services/middleware/photoshop_middleware';
import {
    contextErrorMessage,
    generationErrorMessage,
    validateContext,
} from 'services/validation_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';

type RegenerationToolProps = {
    icon?: FC<any>;
    label?: string;
    contextId: string;
    isPrimary?: boolean;
};

export default function RegenerationTool(props: RegenerationToolProps) {
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    const saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    let getNumImagesGeneratedWithinTimeFrame = useContextStore(
        (state) => state.getNumImagesGeneratedWithinTimeFrame
    );

    let setNumImagesGeneratedWithinTimeFrame = useContextStore(
        (state) => state.setNumImagesGeneratedWithinTimeFrame
    );
    let [isGenerating, setIsGenerating] = useState(false);
    let modalRef = React.useRef<ExtendedHTMLDialogElement>(null);

    return (
        <div
            className="flex items-center mr-1 cursor-pointer"
            onClick={async () => {
                {
                    let generationCredits =
                        MAX_IMAGES_GENERATED_WITHIN_TIME_FRAME -
                        getNumImagesGeneratedWithinTimeFrame();
                    if (
                        generationCredits <= 0 &&
                        getContextFromStore(props.contextId).is_cloud_run
                    ) {
                        // generationErrorMessage();
                        return;
                    }

                    let contextValidation = validateContext(
                        getContextFromStore(props.contextId)
                    );
                    if (!contextValidation.isValid) {
                        contextErrorMessage(contextValidation);
                        return;
                    }
                    let layer = null;

                    if (
                        (getContextFromStore(props.contextId)?.currentLayer
                            ?.visible ||
                            props.isPrimary) &&
                        getContextFromStore(props.contextId).is_cloud_run
                    ) {
                        let numImagesGeneratedWithinTimeFrame =
                            getNumImagesGeneratedWithinTimeFrame();
                        setNumImagesGeneratedWithinTimeFrame(
                            numImagesGeneratedWithinTimeFrame + 1
                        );
                    }

                    setIsGenerating(true);
                    if (!props.isPrimary) {
                        layer = await regenerateLayer(
                            getContextFromStore(props.contextId),
                            saveContextToStore,
                            getContextFromStore
                        );
                    } else {
                        layer = await regenerateDocument(
                            getContextFromStore(props.contextId),
                            saveContextToStore,
                            getContextFromStore
                        );
                    }

                    setIsGenerating(false);
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
                {!isGenerating ? (
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
