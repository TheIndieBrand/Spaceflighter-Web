export {};

declare global {
    interface Window {
        __SPACE_DATA__: {
            galaxies?: { x: number; y: number }[];
            systems?: { x: number; y: number; galaxyId: string }[];
            planets?: { x: number; y: number; solarSystemId: string }[];
        };
    }
}
