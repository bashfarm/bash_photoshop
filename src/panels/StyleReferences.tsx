import React from 'react';
import { Divider, Icon } from 'react-uxp-spectrum';
import { ArtistDropdowns } from 'components/StyleReferences/ArtistDropdowns';
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

export type StyleImagesProps = {
    src: string;
};

const StyleImages = (props: StyleImagesProps) => {
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
    return (
        <div className="flex flex-col">
            {/* <Heading size="XS" weight="light">
                Artist List
            </Heading> */}
            <ArtistDropdowns />

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
