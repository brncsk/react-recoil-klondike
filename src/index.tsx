import React from "react";
import ReactDOM from "react-dom/client";

import { RecoilRoot } from "recoil";

import "./styles/index.css";
import App from "./containers/App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>
);
