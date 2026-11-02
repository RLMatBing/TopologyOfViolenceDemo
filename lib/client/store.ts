"use client";
import { create } from "zustand";

type UiState={selected:string|null;notice:string;setSelected:(id:string|null)=>void;setNotice:(notice:string)=>void};
export const useAscentUi=create<UiState>(set=>({selected:null,notice:"",setSelected:selected=>set({selected}),setNotice:notice=>set({notice})}));
