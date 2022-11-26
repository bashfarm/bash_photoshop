import React, { useState } from 'react';
import {
    Textarea,
    ActionButton,
    Icon,
    Divider,
    Heading,
} from 'react-uxp-spectrum';
import { TagSelector } from '@components/TagSelector';
import { txt2Img, FormatBase64Image } from '../utils/ai_service';
import { SaveB64ImageToBinaryFileToDataFolder } from '../utils/io_service';
import { PlaceImageFromDataOnLayer } from '../utils/layer_service';

// import '../style.css';

const dummyArray = [
    { id: 1, value: 30, src: 'img/cat.jpg' },
    { id: 2, value: 40, src: 'img/cat.jpg' },
    { id: 3, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
];

const AssetItem = ({ src }) => {
    const handleClick = async (src) => {
        await SaveB64ImageToBinaryFileToDataFolder(`${src.slice(-3)}-img`, src);
        await PlaceImageFromDataOnLayer(`${src.slice(-3)}-img`);
    };
    return (
        <div className="mx-5">
            <img
                className="rounded-sm w-[90px] hover:border"
                src={src}
                alt="Demo Image"
                onClick={() => handleClick(src)}
            />
        </div>
    );
};

export const SmallUiDetail = () => {
    const [prompt, setPrompt] = useState('');
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    // const bears = useAppStore((state) => state.bears);
    // const increasePopulation = useAppStore((state) => state.increasePopulation);
    // let newimg = FormatBase64Image(image[0]);

    const generateImages = async (prompt) => {
        if (!prompt) return;
        if (images.length > 0) setImages([]);
        try {
            setLoadingImages(true);
            const data = await txt2Img(prompt);
            for (const image of data.images) {
                setImages((oldImages) => [
                    ...oldImages,
                    FormatBase64Image(image),
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
                title="test"
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
