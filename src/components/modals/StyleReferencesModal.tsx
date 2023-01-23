import React from 'react';
import { Button, Icon, ToolTip } from 'react-uxp-spectrum';

import ArtistDropdown from 'components/ArtistDropdowns';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import StyleReference from 'models/StyleReference';
import { ExtendedHTMLDialogElement } from 'common/types';
import _ from 'lodash';
import { ContextDivider } from 'components/Context/ContextDivider';
import { ContextType } from 'bashConstants';
import { ContextProps } from 'components/Context/ContextProps';
const StyleReferences: Array<StyleReference> = [
    new StyleReference('kitty', '', 'img/cat.jpg', [], [], []),
    new StyleReference('kitty', '', 'img/cat.jpg', [], [], []),
    new StyleReference('kitty', '', 'img/cat.jpg', [], [], []),
    new StyleReference('kitty', '', 'img/cat.jpg', [], [], []),
];
interface ModalProps extends ContextProps {
    handle: ExtendedHTMLDialogElement;
}

export function StyleReferencesModal(props: ModalProps) {
    let context = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID, props.contextType)
    );

    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    function removeStyleReference(styleRef: StyleReference) {
        let newStyleReferences = context.styleReferences.filter(
            (contextStyleRef: StyleReference) =>
                contextStyleRef.id !== styleRef.id
        );
        let copyOfContext = context.copy();
        copyOfContext.styleReferences = newStyleReferences;
        saveContextToStore(copyOfContext);
    }

    function createContextStyleRef() {
        let newStyleReferences = context.styleReferences;
        newStyleReferences.push(new StyleReference());
        let copyOfContext = context.copy();
        copyOfContext.styleReferences = newStyleReferences;
        saveContextToStore(copyOfContext);
    }

    return (
        <div className="flex flex-col">
            <ToolTip>yolo</ToolTip>

            <Button variant="primary" onClick={createContextStyleRef}>
                Add new artist
            </Button>

            {context.styleReferences &&
                context.styleReferences.map((styleRef: StyleReference) => (
                    <ArtistDropdown
                        key={styleRef.id}
                        contextID={props.contextID}
                        contextType={ContextType.LAYER}
                        styleRef={styleRef}
                        removeStyleReference={() =>
                            removeStyleReference(styleRef)
                        }
                    />
                ))}

            <ContextDivider animate={false} />

            {/* ❤️‍🔥 TODO:MAKE IMAGES REFERENCE STYLES. The images in the dialog to be displayed! ❤️‍🔥  */}
            {/* <div className="flex flex-wrap mb-4 w-full justify-center">
                {StyleReferences.map((item) => (
                    <StyleImage
                        key={`asset-item-${item.id}`}
                        src={item.src}
                        onSelect={() => {
                            console.log('Selected: ', item);

                            toggleStyleSelected(item);
                        }}
                    />
                ))}
            </div> */}
            {/* ❤️‍🔥 The images in the dialog to be displayed! ❤️‍🔥  */}

            <div className="flex w-1/4 justify-between mx-auto">
                <Icon size="m" name="ui:ChevronLeftMedium"></Icon>
                <Icon size="m" name="ui:ChevronRightMedium"></Icon>
            </div>
        </div>
    );
}
