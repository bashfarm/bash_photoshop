import { ContextType } from 'bashConstants';
import photoshop from 'photoshop';
import React, { FC, useEffect, useState } from 'react';
import Progressbar from 'react-uxp-spectrum/dist/Progressbar';
import {
    generateAILayer,
    getImageProcessingProgress,
} from 'services/ai_service';
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
    // Set up a state variable to hold the progress value
    const [imageProgress, setImageProgress] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    // Set up a state variable to hold the interval ID
    const [intervalTimer, setIntervalTimer] = useState<NodeJS.Timer | null>(
        null
    );
    let prevVal = -1;

    // Define a function to update the progress value
    const updateImageProgress = async (): Promise<void> => {
        setRetryCount(retryCount + 1);
        // Call the getImageProcessingProgress function
        const progressResponse = await getImageProcessingProgress();
        // Update the imageProgress state variable with the progress value from the response
        setImageProgress(progressResponse?.progress ?? 0.1);
        prevVal = progressResponse.progress;
        // Check if the progress is 1

        if (prevVal == 0 || retryCount >= 2) {
            setImageProgress(1);
        }
    };

    // Define a function to start the progress updates
    const startProgressUpdates = (): void => {
        // Set the interval to call the updateImageProgress function every 1 second
        // setIntervalTimer(setInterval(updateImageProgress, 1000));
    };
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
            const copyOfContext = layerContext.copy();

            if (await layerContext.hasLayerMask()) {
                duplicatedLayer = await layerContext.duplicateCurrentLayer();
                copyOfContext.currentLayerName = duplicatedLayer.name;
                await copyOfContext.applyLayerMask();
            }

            const newLayer = await generateAILayer(layerContext);

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

    useEffect(() => {
        if (imageProgress == 1) {
            clearInterval(intervalTimer);
        } else if (retryCount >= 2) {
            clearInterval(intervalTimer);
        }

        console.log('retryCount', retryCount);
        console.log('imageProgress', imageProgress);
    }, [imageProgress, retryCount]);

    const handleButtonClick = (): void => {
        regenerateLayer(false, props.contextId);
        startProgressUpdates();
    };

    return (
        <div
            className="flex items-center mr-1 cursor-pointer"
            onMouseLeave={() => setIsHovered(false)}
            onMouseEnter={() => setIsHovered(true)}
            onClick={handleButtonClick}
        >
            {props.icon && (
                <props.icon
                    {...{
                        style: {
                            color: isHovered
                                ? 'var(--uxp-host-text-color-secondary)'
                                : 'var(--uxp-host-text-color)',
                        },
                        fontSize: 'small',
                    }}
                />
            )}
            {props.label && (
                <div
                    className="ml-1 mr-10 whitespace-nowrap"
                    style={{
                        color: isHovered
                            ? 'var(--uxp-host-text-color-secondary)'
                            : 'var(--uxp-host-label-text-color)',
                    }}
                >
                    {props.label}
                </div>
            )}
            <Progressbar
                min={0}
                max={1}
                value={imageProgress}
                className="py-2 min-w-[50px] w-full"
            />
        </div>
    );
}
