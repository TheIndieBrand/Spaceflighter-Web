import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone',
    }),
    devToolbar: {
        enabled: false
    },
    server: {
        host: "0.0.0.0", 
        port: "4321",
    }
});