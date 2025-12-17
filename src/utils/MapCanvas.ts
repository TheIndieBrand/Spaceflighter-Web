export type Camera = {
    x: number;
    y: number;
    zoom: number;
};

export type MapMode = "GALAXY" | "SYSTEM" | "PLANET";

export interface MapContext {
    mode: MapMode;
    galaxyId?: string;
    systemId?: string;
}

export interface Galaxy {
    id: string;
    x: number;
    y: number;
    name: string;
}

export interface SolarSystem {
    id: string;
    galaxyId: string;
    x: number;
    y: number;
    name: string;
}

export interface Planet {
    id: string;
    solarSystemId: string;
    x: number;
    y: number;
    name: string;
}

export interface MapData {
    galaxies?: Galaxy[];
    systems?: SolarSystem[];
    planets?: Planet[];
}

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 5;

export class MapCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private camera: Camera = { x: 0, y: 0, zoom: 1 };
    private context: MapContext;
    private data: MapData;
    private stars: {
        x: number;
        y: number;
        size: number;
        alpha: number;
        fadeDir: 1 | -1;
    }[] = [];
    private STAR_COUNT = 10000;
    private hoveredId: string | null = null;

    constructor(canvas: HTMLCanvasElement, context: MapContext, data: MapData) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.context = context;
        this.data = data;

        this.resize();
        this.attachEvents();
        requestAnimationFrame(this.render);
        this.updateHUD();
        this.initStars();
    }

    private updateHUD() {
        const zoomEl = document.getElementById("zoom-value");
        if (zoomEl) zoomEl.textContent = `${this.camera.zoom.toFixed(2)}x`;
    }

    private drawStarShape(x: number, y: number, radius: number, points = 5) {
        const step = Math.PI / points;
        this.ctx.beginPath();

        for (let i = 0; i < 2 * points; i++) {
            const r = i % 2 === 0 ? radius : radius * 0.45;
            const a = i * step;

            this.ctx.lineTo(
                x + Math.cos(a) * r,
                y + Math.sin(a) * r
            );
        }

        this.ctx.closePath();
        this.ctx.fill();
    }

    private initStars() {
        this.stars = [];

        for (let i = 0; i < this.STAR_COUNT; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * 20000,
                y: (Math.random() - 0.5) * 20000,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                fadeDir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    private setStarsInvisible() {
        for (const star of this.stars) star.alpha = 0;
    }

    private updateStars() {
        if (this.stars.reduce((sum, star) => sum + star.alpha, 0) === 0) this.initStars();

        for (const star of this.stars) {
            star.alpha += star.fadeDir * 0.002;

            if (star.alpha <= 0) {
                star.alpha = 0;
                star.fadeDir = 1;
            }

            if (star.alpha >= 1) {
                star.alpha = 1;
                star.fadeDir = -1;
            }
        }
    }

    private resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    private worldToScreen(x: number, y: number) {
        return {
            x: (x - this.camera.x) * this.camera.zoom + this.canvas.width / 2,
            y: (y - this.camera.y) * this.camera.zoom + this.canvas.height / 2
        };
    }

    private isVisible(x: number, y: number, r = 10) {
        return (
            x + r > 0 &&
            y + r > 0 &&
            x - r < this.canvas.width &&
            y - r < this.canvas.height
        );
    }

    private attachEvents() {
        window.addEventListener("resize", () => this.resize());

        this.canvas.addEventListener("wheel", (e) => {
            e.preventDefault();

            const mouseX = e.offsetX;
            const mouseY = e.offsetY;

            const worldX = (mouseX - this.canvas.width / 2) / this.camera.zoom + this.camera.x;
            const worldY = (mouseY - this.canvas.height / 2) / this.camera.zoom + this.camera.y;

            const delta = -e.deltaY * 0.001;
            const newZoom = Math.min(
                ZOOM_MAX,
                Math.max(ZOOM_MIN, this.camera.zoom + delta)
            );

            this.camera.zoom = newZoom;
            this.camera.x = worldX - (mouseX - this.canvas.width / 2) / newZoom;
            this.camera.y = worldY - (mouseY - this.canvas.height / 2) / newZoom;
            this.updateHUD();
        });

        let dragging = false;
        let lastX = 0;
        let lastY = 0;

        this.canvas.addEventListener("mousedown", (e) => {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            this.updateHUD();
        });

        this.canvas.addEventListener("click", (e) => {
            if (this.context.mode === "GALAXY" && this.data.galaxies) {
                for (const g of this.data.galaxies) {
                    const p = this.worldToScreen(g.x, g.y);
                    const dx = e.offsetX - p.x;
                    const dy = e.offsetY - p.y;

                    if (Math.hypot(dx, dy) < 10) {
                        console.log(`Viajando a la galaxia: ${g.name}`);
                        window.location.href = `/map/${g.id}`;
                        break;
                    }
                }
            } else if (this.data.systems) {
                for (const g of this.data.systems) {
                    const p = this.worldToScreen(g.x, g.y);
                    const dx = e.offsetX - p.x;
                    const dy = e.offsetY - p.y;

                    if (Math.hypot(dx, dy) < 10) {
                        window.location.href = `/map/${g.galaxyId}/${g.id}`;
                        break;
                    }
                }
            }
        });

        window.addEventListener("mouseup", () => (dragging = false));

        window.addEventListener("mousemove", (e) => {
            if (!dragging) return;

            const dx = (e.clientX - lastX) / this.camera.zoom;
            const dy = (e.clientY - lastY) / this.camera.zoom;

            this.camera.x -= dx;
            this.camera.y -= dy;

            lastX = e.clientX;
            lastY = e.clientY;
        });

        this.canvas.addEventListener("mousemove", (e) => {
            this.hoveredId = null;

            if (this.context.mode === "GALAXY" && this.data.galaxies) {
                for (const g of this.data.galaxies) {
                    const p = this.worldToScreen(g.x, g.y);
                    const dx = e.offsetX - p.x;
                    const dy = e.offsetY - p.y;

                    if (Math.hypot(dx, dy) < 10) {
                        this.hoveredId = g.id;
                        break;
                    }
                }
            }

            const tooltip = document.getElementById("map-tooltip");

            if (this.hoveredId && tooltip) {
                const g = this.data.galaxies!.find(x => x.id === this.hoveredId)!;
                tooltip.textContent = g.name ?? `Galaxia ${g.id}`;
                tooltip.style.left = `${e.clientX}px`;
                tooltip.style.top = `${e.clientY}px`;
                tooltip.style.opacity = "1";
            } else if (tooltip) tooltip.style.opacity = "0";
            
            if (this.hoveredId) this.canvas.style.cursor = "pointer";
            else this.canvas.style.cursor = dragging ? "grabbing" : "grab";
        });
    }

    private clear() {
        this.ctx.fillStyle = "#0b0b0b";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawStars() {
        for (const star of this.stars) {
            this.ctx.fillStyle = `rgba(220,220,220,${star.alpha * 0.7})`;
            this.drawStarShape(star.x, star.y, star.size);
        }
    }

    private drawGalaxies() {
        if (!this.data.galaxies) return;

        for (const g of this.data.galaxies) {
            const p = this.worldToScreen(g.x, g.y);
            if (!this.isVisible(p.x, p.y, 10)) continue;

            // halo
            this.ctx.fillStyle = "rgba(107, 92, 255, 0.15)";
            this.ctx.beginPath();
            this.ctx.arc(g.x, g.y, 20, 0, Math.PI * 2);
            this.ctx.fill();

            // núcleo
            this.ctx.fillStyle = g.id === this.hoveredId ? "#ffffff" : "#6b5cff";
            this.ctx.beginPath();
            this.ctx.arc(g.x, g.y, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    private drawGrid() {
        const step = 100;
        const dotSize = 2;

        this.ctx.fillStyle = "#3a3f55";

        const minX = Math.floor((this.camera.x - 2000) / step) * step;
        const maxX = minX + 4000;

        const minY = Math.floor((this.camera.y - 2000) / step) * step;
        const maxY = minY + 4000;

        for (let x = minX; x <= maxX; x += step) {
            for (let y = minY; y <= maxY; y += step) {
                if (x === 0 && y === 0) continue;

                this.ctx.fillRect(
                    x - dotSize / 2,
                    y - dotSize / 2,
                    dotSize,
                    dotSize
                );
            }
        }

        this.drawGridLabels(minX, maxX, minY, maxY);
    }

    private drawGridLabels(minX: number, maxX: number, minY: number, maxY: number) {
        this.ctx.save();
        this.ctx.fillStyle = "#7f89b5";
        this.ctx.font = "12px monospace";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText("0:0", -10, - 6);
        this.ctx.fillStyle = "#7f89b5";

        const step = 500;

        for (let x = minX; x <= maxX; x += step) {
            for (let y = minY; y <= maxY; y += step) {
                if (x === 0 && y === 0) continue;
                
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top'; 
                this.ctx.fillText(`${x}:${y}`, x, y + 10);
            }
        }

        this.ctx.restore();
    }

    private renderEntities() {
        if (this.context.mode === "GALAXY") this.drawGalaxies();
        this.drawStars();
    }

    private render = () => {
        this.clear();
        this.ctx.save();

        this.ctx.translate(
            this.canvas.width / 2,
            this.canvas.height / 2
        );

        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);

        if (this.camera.zoom > 0.8) {
            this.drawGrid();
            this.setStarsInvisible();
        } else this.updateStars();

        this.renderEntities();
        this.ctx.restore();

        requestAnimationFrame(this.render);
    };
}
