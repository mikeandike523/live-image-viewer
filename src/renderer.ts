import { IpcRendererEvent } from "electron";
import "./index.css";

const electron = window.require("electron");

console.log(electron.ipcRenderer, electron.ipcMain);

function app() {
  const elemInfoBar = document.querySelector(".InfoBar")!;
  const elemEndpointDisplay = document.querySelector(".EndpointDisplay")!;
  const elemImageNameDisplay = document.querySelector(".ImageNameDisplay")!;
  const elemImageSizeDisplay = document.querySelector(".ImageSizeDisplay")!;

  function onExpressPortFound(event: IpcRendererEvent, port: number) {
    elemEndpointDisplay.textContent = `http://localhost:${port}/pixels`;
  }

  electron.ipcRenderer.on("express-port-found", onExpressPortFound);
}

document.addEventListener("DOMContentLoaded", app);
