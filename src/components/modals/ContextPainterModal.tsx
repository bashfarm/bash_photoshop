import React, { useState } from 'react';
import AssetItem from 'components/AssetItem';
import { Textarea, Icon, Divider, Heading } from 'react-uxp-spectrum';
import { txt2img } from 'services/ai_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import { formatBase64Image } from 'utils/io_utils';

interface ModalProps {
    handle: ExtendedHTMLDialogElement;
    contextID: string;
}

export default function ContextPainterModal(props: ModalProps) {
    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );
    const [generatedImages, setGeneratedImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [prompt, setPrompt] = useState('');

    // // The prompt that goes here is from this component where the user will generate images from
    // // text to put into the UI
    // const generateImages = async (prompt: string) => {
    //     if (!prompt) return;
    //     if (generatedImages.length > 0) setGeneratedImages([]);
    //     try {
    //         setLoadingImages(true);
    //         let copyOfContext = layerContext.copy();
    //         copyOfContext.currentPrompt = prompt;
    //         copyOfContext.batchSize = 5;
    //         const data = await txt2img(copyOfContext);
    //         for (const image of data.images) {
    //             setGeneratedImages((oldImages) => [
    //                 ...oldImages,
    //                 formatBase64Image(image),
    //             ]);
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     } finally {
    //         setLoadingImages(false);
    //     }
    // };
    return (
        <div className="flex flex-col">
            <Textarea
                onInput={(event) => setPrompt(event.target.value)}
                className="w-full"
            />

            <Divider className="my-2" size="small" />
            <Heading size="XS" weight="light">
                Tag Selection
            </Heading>
        </div>
    );
}
