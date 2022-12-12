import { TagSelector } from 'components/TagSelector';
import React, { useState } from 'react';
import {
    Textarea,
    ActionButton,
    Icon,
    Divider,
    Heading,
} from 'react-uxp-spectrum';
import { txt2Img } from '../services/ai_service';
import { saveB64ImageToBinaryFileToDataFolder } from '../services/io_service';
import { createNewLayerFromFile } from '../services/layer_service';
import { formatBase64Image } from '../utils/io_utils';

const dummyArray = [
    { id: 1, value: 30, src: 'img/cat.jpg' },
    { id: 2, value: 40, src: 'img/cat.jpg' },
    { id: 3, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
];

export type AssetItemProps = {
    src: string;
};

const AssetItem = (props: AssetItemProps) => {
    const handleClick = async (src: string) => {
        await saveB64ImageToBinaryFileToDataFolder(`${src.slice(-3)}-img`, src);
        await createNewLayerFromFile(`${src.slice(-3)}-img`);
    };
    return (
        <div className="mx-5">
            <img
                className="rounded-sm w-[90px] hover:border"
                src={props.src}
                alt="Demo Image"
                onClick={() => handleClick(props.src)}
            />
        </div>
    );
};

export const SmallUiDetail = () => {
    const [prompt, setPrompt] = useState('');
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);

    const generateImages = async (prompt: string) => {
        if (!prompt) return;
        if (images.length > 0) setImages([]);
        try {
            setLoadingImages(true);
            const data = await txt2Img(prompt);
            for (const image of data.images) {
                setImages((oldImages) => [
                    ...oldImages,
                    formatBase64Image(image),
                ]);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingImages(false);
        }
    };
    return (
        <div className="flex flex-col">
            <Heading size="XS" weight="light">
                Generated Prompt
            </Heading>
            <Textarea
                onInput={(event) => setPrompt(event.target.value)}
                className="w-full"
            ></Textarea>
            <ActionButton
                disabled={loadingImages}
                onClick={() => generateImages(prompt)}
            >
                {loadingImages ? 'Generating images...' : 'Generate Images'}
            </ActionButton>
            <Divider className="my-2" size="small" />

            <Heading size="XS" weight="light">
                Generated Images
            </Heading>
            <div className="flex items-center mx-auto">
                {images.length != 0
                    ? images.map((item, index) => (
                          <AssetItem key={`asset-item-${index}`} src={item} />
                      ))
                    : dummyArray.map((item) => (
                          <AssetItem
                              key={`asset-item-${item.id}`}
                              src={item.src}
                          />
                      ))}
                {/* {images.map((item, index) => (
                    <AssetItem key={`asset-item-${index}`} src={item} />
                ))} */}
                <Icon size="m" name="ui:ChevronDownMedium" />
            </div>

            <Divider className="my-2" size="small" />
            <Heading size="XS" weight="light">
                Tag Selection
            </Heading>
            <TagSelector tagArray={dummyArray} />
        </div>
    );
};
