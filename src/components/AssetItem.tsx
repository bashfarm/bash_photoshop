import React from 'react';
import { createNewLayerFromFile } from 'services/layer_service';

interface AssetItemProps {
    src: string;
}

const AssetItem = (props: AssetItemProps) => {
    const handleClick = async (src: string) => {
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

export default AssetItem;
