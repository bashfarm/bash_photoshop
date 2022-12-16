import React from 'react';

interface StyleImagesProps {
    src: string;
    onSelect: () => void;
}

const StyleImage = (props: StyleImagesProps) => {
    let [isSelected, setIsSelected] = React.useState(false);

    function handleClick() {
        props.onSelect();
        setIsSelected(!isSelected);
    }

    return (
        <img
            // create a pink border around the image when it is selected and temporarily change the border color to blue enlarge it on hover
            className={`rounded-sm w-1/5 m-2 border-2 border-transparent hover:border-blue-500 ${
                isSelected ? 'border-pink-500' : ''
            }`}
            src={props.src}
            onSelect={props.onSelect}
            onClick={handleClick}
        />
    );
};

export default StyleImage;
