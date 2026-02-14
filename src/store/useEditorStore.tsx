import React from "react";
import { createContext, useContext } from "react";
import AppState from "./state";

const store = AppState.create();

export const EditorContext = createContext(store);

export const EditorContextProvider = (props: React.PropsWithChildren) => {
  return <EditorContext.Provider value={store} {...props} />;
};

export default function useEditorState() {
  return useContext(EditorContext);
}
