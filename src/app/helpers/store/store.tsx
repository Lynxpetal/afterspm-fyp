import { create } from "zustand";

interface StringState {
    value: string;
    setValue: (input: string) => void;
    resetValue: () => void;
}

const useStringStore = create<StringState>(
    (set) => ({
        value: "",
        setValue: (input: string) => set((state) => ({ ...state, value: input })),
        resetValue: () => set((state) => ({ ...state, count: "" })),
    }),
    );

export default useStringStore;