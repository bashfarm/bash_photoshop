import React from 'react';

interface StyleImagesProps {
    src: string;
}

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

export default StyleImages;
