import React from 'react';

interface StyleImagesProps {
    src: string;
    onSelect: () => void;
}

const StyleImage = (props: StyleImagesProps) => {
    return (
        <img
            className="rounded-sm w-1/5 m-2"
            src={props.src}
            alt="Demo Image"
            onSelect={props.onSelect}
            // onClick={() => handleClick(src)}
        />
    );
};

export default StyleImage;
