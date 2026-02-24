import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                about: 'about.html',
                events: 'events.html',
                hackathon: 'hackathon.html',
                promptLibrary: 'prompt-library.html',
                success: 'success.html'
            }
        }
    }
});
