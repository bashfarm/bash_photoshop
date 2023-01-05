import photoshop from 'photoshop';
import React, { FC, useEffect, useState } from 'react';
import Progressbar from 'react-uxp-spectrum/dist/Progressbar';
import {
    generateAILayer,
    getImageProcessingProgress,
} from 'services/ai_service';
import { alert } from 'services/alert_service';
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
    newLayerNameSetter: Function;
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
    // Set up a state variable to hold the interval ID
    const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);
    let prevVal = -1;

    // Define a function to update the progress value
    const updateImageProgress = async (): Promise<void> => {
        let imageProcessingCompleted: boolean = false;
        // Call the getImageProcessingProgress function
        const progressResponse = await getImageProcessingProgress();
        // Update the imageProgress state variable with the progress value from the response
        setImageProgress(progressResponse.progress);
        prevVal = progressResponse.progress;
        // Check if the progress is 1
        if (progressResponse.progress === 1) {
            imageProcessingCompleted = true;
        }
        if (prevVal == 0) {
            setImageProgress(1);
        }
    };

    // Define a function to start the progress updates
    const startProgressUpdates = (): void => {
        // Set the interval to call the updateImageProgress function every 1 second
        setIntervalId(setInterval(updateImageProgress, 1000));
    };
    async function regenerateLayer(
        deleteOldLayer: boolean = false,
        contextID: string
    ) {
        let maskWasApplied = false;
        let duplicatedLayer = null;

        try {
            const layerContext = getContextFromStore(contextID);
            const oldLayer = layerContext.currentLayer;
            const copyOfContext = layerContext.copy();

            if (await layerContext.hasLayerMask()) {
                duplicatedLayer = await layerContext.duplicateCurrentLayer();
                copyOfContext.currentLayer = duplicatedLayer;
                maskWasApplied = await copyOfContext.applyLayerMask();
            }

            const newLayer = await generateAILayer(layerContext);

            copyOfContext.currentLayer = newLayer;
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

            props.newLayerNameSetter(newLayer.name);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        if (imageProgress == 1) clearInterval(intervalId);
    }, [imageProgress]);

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
