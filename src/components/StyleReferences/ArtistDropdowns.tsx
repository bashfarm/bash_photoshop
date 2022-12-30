import React from 'react';
import { ArtistType } from 'common/types/sdapi';
import { useAsyncEffect } from 'hooks/fetchHooks';
import Spectrum, { Button, Dropdown, Label, ToolTip } from 'react-uxp-spectrum';
import Menu from 'react-uxp-spectrum/dist/Menu';
import MenuItem from 'react-uxp-spectrum/dist/MenuItem';
import { getArtistCategories, getArtists } from 'services/ai_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import StyleReference from '../../models/StyleReference';

export type ArtistDropdownsProps = {
    contextID: string;
    removeStyleReference: Function;
    styleRef: StyleReference;
};

// TODO: kevmok - need to refactor for better error handling
const ArtistDropdowns = (props: ArtistDropdownsProps) => {
    const { value: artists } = useAsyncEffect(getArtists);
    const { value: categories, loading: categoriesLoading } =
        useAsyncEffect(getArtistCategories);

    let saveContextToStore = useContextStore((state: ContextStoreState) => {
        return state.saveContextToStore;
    });
    const layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );

    let styleRefs = artists?.map(
        (artist: ArtistType) =>
            new StyleReference(
                artist.name,
                artist.name,
                'TBD: artist.image',
                [artist.category],
                [],
                [artist.name]
            )
    );

    return (
        <div className="flex items-center justify-items-center">
            <div></div>
            <Dropdown>
                <Label slot="label">Categories</Label>
                <Menu slot="options">
                    {categoriesLoading ? (
                        <MenuItem>Loading categories...</MenuItem>
                    ) : (
                        categories?.map((name: string, index: number) => (
                            <MenuItem
                                selected={name === props.styleRef.categories[0]}
                                onClick={(e: any) => {
                                    let copyOfContext = layerContext.copy();
                                    let copyOfStyleRef = props.styleRef.copy();
                                    copyOfStyleRef.categories = [
                                        e.target.value,
                                    ];
                                    let contextStyleRefIndex =
                                        layerContext.styleReferences.findIndex(
                                            (styleRef: StyleReference) =>
                                                styleRef.id ===
                                                props.styleRef.id
                                        );
                                    copyOfContext.styleReferences[
                                        contextStyleRefIndex
                                    ] = copyOfStyleRef;

                                    saveContextToStore(copyOfContext);
                                    console.log(copyOfContext);
                                }}
                                key={`${name}-${index}`}
                            >
                                {name}
                            </MenuItem>
                        ))
                    )}
                </Menu>
            </Dropdown>
            <Dropdown>
                <Label slot="label">Artists</Label>
                <Menu slot="options">
                    {styleRefs
                        ?.filter((item: StyleReference, index: number) => {
                            return (
                                item.categories[0] ===
                                props.styleRef.categories[0]
                            );
                        })
                        .map((item: StyleReference, index: number) => {
                            return (
                                <MenuItem
                                    selected={
                                        item.artists[0] ===
                                        props.styleRef.artists[0]
                                    }
                                    onClick={(e: any) => {
                                        let copyOfContext = layerContext.copy();
                                        let copyOfStyleRef =
                                            props.styleRef.copy();
                                        copyOfStyleRef.name = item.name;
                                        copyOfStyleRef.artists = item.artists;
                                        copyOfStyleRef.categories =
                                            item.categories;

                                        let contextStyleRefIndex =
                                            layerContext.styleReferences.findIndex(
                                                (styleRef: StyleReference) =>
                                                    styleRef.id ===
                                                    props.styleRef.id
                                            );
                                        copyOfContext.styleReferences[
                                            contextStyleRefIndex
                                        ] = copyOfStyleRef;

                                        saveContextToStore(copyOfContext);
                                        console.log(copyOfContext);
                                    }}
                                    key={`${item.name}-${index}`}
                                >
                                    {item.name}
                                </MenuItem>
                            );
                        })}
                </Menu>
            </Dropdown>

            <Button
                className="mt-5"
                variant="primary"
                onClick={() => props.removeStyleReference()}
            >
                Remove
            </Button>
        </div>
    );
};

export default ArtistDropdowns;
