import { IpcRendererEvent } from "electron";
import "./index.css";


function app() {
  const electron = window.require("electron");

  const elemEndpointDisplay = document.querySelector(".EndpointDisplay")!;
  const elemImageNameDisplay = document.querySelector(".ImageNameDisplay")!;
  const elemImageSizeDisplay = document.querySelector(".ImageSizeDisplay")!;
  const elemImageViewer = document.querySelector(".ImageViewer")!;
  const elemImage = document.querySelector(".Image")! as HTMLImageElement;

  // For now, we will assume resize never occurs
  // In the electron app, resizing is disabled and the window is sized to fit perfectly on the desktop
  // We can work on improving this in the future

  const ivWidth = elemImageViewer.getBoundingClientRect().width;
  const ivHeight = elemImageViewer.getBoundingClientRect().height;

  /**
   *
   * Scales up or down the dimensions of the image such that both the width and height fit inside the viewer
   * and the scaling is as large as possible
   *
   * @returns the new width and height to maintain aspect ratio
   */
  function getScaleToFitViewer(initWidth: number, initHeight: number) {
    const scaleX = ivWidth / initWidth;
    const scaleY = ivHeight / initHeight;
    const isLandscape = initWidth >= initHeight;

    const scalingOptions = [];

    if (isLandscape) {
      // prefer to try scaling X first
      scalingOptions.push(scaleX);
      scalingOptions.push(scaleY);
    } else {
      // prefer to try scaling Y first
      scalingOptions.push(scaleY);
      scalingOptions.push(scaleX);
    }

    let scaleFactor: number | undefined = undefined;

    for (const scale of scalingOptions) {
      const newWidth = initWidth * scale;
      const newHeight = initHeight * scale;
      if (newWidth <= ivWidth && newHeight <= ivHeight) {
        scaleFactor = scale;
        break;
      }
    }

    if (typeof scaleFactor === "undefined") {
      throw new Error("No valid scaling factor to fit image viewer");
    }

    return scaleFactor;
  }

  function imagePosDimenToViewerPosDimen(
    width: number,
    height: number,
    scaleFactor = 1.0
  ) {
    const sW = width * scaleFactor;
    const sY = height * scaleFactor;
    const xRelToIv = (ivWidth - sW) / 2;
    const yRelToIv = (ivHeight - sY) / 2;
    return {
      width: sW,
      height: sY,
      left: xRelToIv,
      top: yRelToIv,
    };
  }

  function onExpressPortFound(event: IpcRendererEvent, port: number) {
    elemEndpointDisplay.textContent = `http://localhost:${port}/pixels`;
  }

  function onImageData(
    event: IpcRendererEvent,
    data: {
      name: string;
      width: number;
      height: number;
      src: string;
      scaleMode: "fit-preserve-aspect" | "unchanged";
    }
  ) {
    elemImageNameDisplay.textContent = data.name;
    elemImageSizeDisplay.textContent = `${data.width}\u{00D7}${data.height}`;
    const scale = data.scaleMode === "fit-preserve-aspect" ? getScaleToFitViewer(data.width, data.height) : 1.0
    const {
      width:imageCssW,
      height:imageCssH,
      left:imageLeft,
      top:imageTop,
    } = imagePosDimenToViewerPosDimen(data.width, data.height, scale)
    elemImage.setAttribute("width",imageCssW.toString());
    elemImage.setAttribute("height", imageCssH.toString());
    elemImage.style.left = imageLeft.toString() + "px";
    elemImage.style.top = imageTop.toString() + "px";
    elemImage.style.width = imageCssW.toString() + "px";
    elemImage.style.height = imageCssW.toString() + "px";
    elemImage.style.display = "block";
    elemImage.src = data.src;
  }

  electron.ipcRenderer.on("express-port-found", onExpressPortFound);
  electron.ipcRenderer.on("image-data", onImageData);
  electron.ipcRenderer.send("frontend-app-loaded", true);
}

document.addEventListener("DOMContentLoaded", app);
