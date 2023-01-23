// import React, { useState } from 'react';
// import TagSelector from 'components/TagSelector';
// import AssetItem from 'components/AssetItem';
// import { Textarea, Icon, Divider, Heading } from 'react-uxp-spectrum';
// import { txt2img } from 'services/ai_service';
// import { ContextStoreState, useContextStore } from 'store/contextStore';
// import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
// import { formatBase64Image } from 'utils/io_utils';
// import { ContextType } from 'bashConstants';

// const dummyArray = [
//     { id: 1, value: 30, src: 'img/cat.jpg' },
//     { id: 2, value: 40, src: 'img/cat.jpg' },
//     { id: 3, value: 30, src: 'img/cat.jpg' },
//     { id: 4, value: 30, src: 'img/cat.jpg' },
// ];

// interface ModalProps {
//     handle: ExtendedHTMLDialogElement;
//     contextID: string;
// }

// export default function (props: ModalProps) {
//     let layerContext = useContextStore((state: ContextStoreState) =>
//         state.getContextFromStore(props.contextID, ContextType.LAYER)
//     );

//     let saveContextToStore = useContextStore(
//         (state: ContextStoreState) => state.saveContextToStore
//     );
//     const [generatedImages, setGeneratedImages] = useState([]);
//     const [loadingImages, setLoadingImages] = useState(false);
//     const [imageProgress, setImageProgress] = useState(0);
//     const [prompt, setPrompt] = useState('');

//     // The prompt that goes here is from this component where the user will generate images from
//     // text to put into the UI
//     const generateImages = async (prompt: string) => {
//         if (!prompt) return;
//         if (generatedImages.length > 0) setGeneratedImages([]);
//         try {
//             setLoadingImages(true);
//             let copyOfContext = layerContext.copy();
//             copyOfContext.currentPrompt = prompt;
//             copyOfContext.batchSize = 5;
//             const data = await txt2img(copyOfContext);
//             for (const image of data.images) {
//                 setGeneratedImages((oldImages) => [
//                     ...oldImages,
//                     formatBase64Image(image),
//                 ]);
//             }
//         } catch (error) {
//             console.log(error);
//         } finally {
//             setLoadingImages(false);
//         }
//     };
//     return (
//         <div className="flex flex-col">
//             <Heading size="XS" weight="light">
//                 Generated Prompt
//             </Heading>
//             <Textarea
//                 onInput={(event) => setPrompt(event.target.value)}
//                 className="w-full"
//             ></Textarea>

//             <Divider className="my-2" size="small" />

//             <Heading size="XS" weight="light">
//                 Generated Images
//             </Heading>
//             <div className="flex items-center mx-auto">
//                 {generatedImages.length != 0
//                     ? generatedImages.map((item, index) => (
//                           <AssetItem key={`asset-item-${index}`} src={item} />
//                       ))
//                     : dummyArray.map((item) => (
//                           <AssetItem
//                               key={`asset-item-${item.id}`}
//                               src={item.src}
//                           />
//                       ))}
//                 {/* {images.map((item, index) => (
//                     <AssetItem key={`asset-item-${index}`} src={item} />
//                 ))} */}
//                 <Icon size="m" name="ui:ChevronDownMedium" />
//             </div>

//             <Divider className="my-2" size="small" />
//             <Heading size="XS" weight="light">
//                 Tag Selection
//             </Heading>
//             <TagSelector tagArray={dummyArray} />
//         </div>
//     );
// }
