import App from "./App";
const manifest = require("../plugin/manifest.json");

import { entrypoints } from "uxp";

import PanelController from "./controllers/PanelController"
entrypoints.setup({
  panels: {
    [manifest.entrypoints[0].id]: PanelController(<App />, {})
  }
})