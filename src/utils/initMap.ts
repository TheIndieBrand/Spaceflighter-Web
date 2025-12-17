import { MapCanvas, type MapContext, type MapData } from "./MapCanvas";

export function initMap(context: MapContext, data: MapData) {
    const canvas = document.getElementById("space-map");

    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Canvas #space-map not found");

    new MapCanvas(canvas, context, data);
}
