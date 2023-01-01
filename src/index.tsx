import React from "react";
import ReactDOM from "react-dom/client";

import { RecoilRoot } from "recoil";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <RecoilRoot>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </RecoilRoot>
  </React.StrictMode>
);
