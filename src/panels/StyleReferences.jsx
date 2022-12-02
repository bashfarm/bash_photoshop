import React, { useState } from 'react';
import {
    Textarea,
    ActionButton,
    Divider,
    Heading,
    Icon,
    Textfield,
} from 'react-uxp-spectrum';
const dummyArray = [
    { id: 1, value: 30, src: 'img/cat.jpg' },
    { id: 2, value: 40, src: 'img/cat.jpg' },
    { id: 3, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
];

const StyleImages = (props) => {
    return (
        <img
            className="rounded-sm w-1/5 m-2"
            src={props.src}
            alt="Demo Image"
            // onClick={() => handleClick(src)}
        />
    );
};

export const StyleReferences = () => {
    const [loadingImages, setLoadingImages] = useState(false);

    return (
        <div className="flex flex-col">
            <Heading size="XS" weight="light">
                Style Reference Images
            </Heading>
            <Textfield
                // onInput={(event) => setPrompt(event.target.value)}
                className="w-full"
                placeholder="Search me!"
            ></Textfield>
            <ActionButton
                // disabled={loadingImages}
                // onClick={() => generateImages(prompt)}
                title="test"
            >
                {loadingImages
                    ? 'Searching for images...'
                    : 'Search for images'}
            </ActionButton>
            <Divider className="my-2" size="small" />
            <div className="flex flex-wrap mb-4 w-full justify-center">
                {dummyArray.map((item) => (
                    <StyleImages key={`asset-item-${item.id}`} src={item.src} />
                ))}
            </div>
            <div className="flex w-1/4 justify-between mx-auto">
                <Icon size="m" name="ui:ChevronLeftMedium"></Icon>
                <Icon size="m" name="ui:ChevronRightMedium"></Icon>
            </div>
        </div>
    );
};
