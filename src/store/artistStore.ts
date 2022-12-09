import create from 'zustand';

interface ArtistState {
    artist: String;
    category: string;
    selectArtist: (aritstSelected: string) => void;
    selectCategory: (categorySelected: string) => void;
}

export const useArtistStore = create((set) => ({
    artist: '',
    category: '',
    selectArtist: (artistSelected: string) => set({ artist: artistSelected }),
    selectCategory: (categorySelected: string) =>
        set({ category: categorySelected }),
    // increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
}));
