import { ArtistType } from 'common/types/sdapi';
import React from 'react';
import { Divider, Dropdown, Icon, Label } from 'react-uxp-spectrum';
import Menu from 'react-uxp-spectrum/dist/Menu';
import MenuItem from 'react-uxp-spectrum/dist/MenuItem';
import { useAsyncEffect } from '../hooks/fetchHooks';
import { getArtists, getArtistCategories } from '../services/ai_service';
import { ArtistState, useArtistStore } from '../store/artistStore';
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

// TODO: @kevmok convert into its own component
const ArtistDropdowns = () => {
    const { data: artists } = useAsyncEffect(getArtists);
    const { data: category, loading: categoryLoading } =
        useAsyncEffect(getArtistCategories);

    const { selectedCategory, selectedArtist, selectCategory, selectArtist } =
        useArtistStore((state: ArtistState) => ({
            selectedCategory: state.category,
            selectedArtist: state.artist,
            selectCategory: state.selectCategory,
            selectArtist: state.selectArtist,
        }));

    let filteredArtists = [];
    if (selectedCategory) {
        filteredArtists = artists.filter(
            (artist: ArtistType) => artist.category === selectedCategory
        );
    }

    return (
        <div className="flex">
            <Dropdown>
                <Label slot="label">Categories</Label>
                <Menu slot="options">
                    {categoryLoading ? (
                        <MenuItem>Loading categories...</MenuItem>
                    ) : (
                        category.map((name: string, index: number) => (
                            <MenuItem
                                onClick={(e: any) =>
                                    selectCategory(e.target.value)
                                }
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
                    {!selectedCategory ? (
                        <MenuItem disabled>Select a category...</MenuItem>
                    ) : (
                        filteredArtists.map(
                            (item: ArtistType, index: number) => (
                                <MenuItem
                                    onClick={(e: any) =>
                                        selectArtist(e.target.value)
                                    }
                                    key={`${item.name}-${index}`}
                                >
                                    {item.name}
                                </MenuItem>
                            )
                        )
                    )}
                </Menu>
            </Dropdown>
        </div>
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
