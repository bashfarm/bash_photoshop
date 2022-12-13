import React from 'react';
import { ArtistType } from 'common/types/sdapi';
import { useAsyncEffect } from 'hooks/fetchHooks';
import { Dropdown, Label } from 'react-uxp-spectrum';
import Menu from 'react-uxp-spectrum/dist/Menu';
import MenuItem from 'react-uxp-spectrum/dist/MenuItem';
import { getArtistCategories, getArtists } from 'services/ai_service';
import { useArtistStore, ArtistState } from 'store/artistStore';

export const ArtistDropdowns = () => {
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
