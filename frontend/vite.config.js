import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      // Plugin to transform service worker file with env variables
      {
        name: 'transform-sw',
        configureServer(server) {
          // Transform service worker in dev mode
          server.middlewares.use('/firebase-messaging-sw.js', (req, res, next) => {
            if (req.method === 'GET') {
              const swPath = resolve(__dirname, 'public/firebase-messaging-sw.js');
              let swContent = readFileSync(swPath, 'utf-8');
              
              // Replace config with env variables
              const firebaseConfig = {
                apiKey: env.VITE_FIREBASE_API_KEY || '',
                authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
                projectId: env.VITE_FIREBASE_PROJECT_ID || '',
                storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
                messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
                appId: env.VITE_FIREBASE_APP_ID || '',
                measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || ''
              };
              
              const configString = JSON.stringify(firebaseConfig, null, 2);
              swContent = swContent.replace(
                /const firebaseConfig = \{[\s\S]*?\};/,
                `const firebaseConfig = ${configString};`
              );
              
              res.setHeader('Content-Type', 'application/javascript');
              res.end(swContent);
            } else {
              next();
            }
          });
        },
        writeBundle() {
          // Transform service worker in build mode
          // Load env again in writeBundle hook (mode is 'production' during build)
          const buildEnv = loadEnv('production', process.cwd(), '');
          const swPath = resolve(__dirname, 'public/firebase-messaging-sw.js');
          const distSwPath = resolve(__dirname, 'dist/firebase-messaging-sw.js');
          
          try {
            let swContent = readFileSync(swPath, 'utf-8');
            
            // Replace config with env variables
            const firebaseConfig = {
              apiKey: buildEnv.VITE_FIREBASE_API_KEY || '',
              authDomain: buildEnv.VITE_FIREBASE_AUTH_DOMAIN || '',
              projectId: buildEnv.VITE_FIREBASE_PROJECT_ID || '',
              storageBucket: buildEnv.VITE_FIREBASE_STORAGE_BUCKET || '',
              messagingSenderId: buildEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
              appId: buildEnv.VITE_FIREBASE_APP_ID || '',
              measurementId: buildEnv.VITE_FIREBASE_MEASUREMENT_ID || ''
            };
            
            const configString = JSON.stringify(firebaseConfig, null, 2);
            swContent = swContent.replace(
              /const firebaseConfig = \{[\s\S]*?\};/,
              `const firebaseConfig = ${configString};`
            );
            
            // Write transformed service worker to dist
            mkdirSync(resolve(__dirname, 'dist'), { recursive: true });
            writeFileSync(distSwPath, swContent, 'utf-8');
          } catch (error) {
            console.warn('Could not transform service worker during build:', error.message);
          }
        }
      }
    ],
    css: {
      postcss: './postcss.config.js',
    },
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
    // Configure server to serve service worker with correct MIME type
    server: {
      headers: {
        'Service-Worker-Allowed': '/',
      },
    },
    // Ensure service worker is served correctly in production
    build: {
      rollupOptions: {
        output: {
          // Preserve service worker files
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'firebase-messaging-sw.js') {
              return 'firebase-messaging-sw.js';
            }
            return assetInfo.name || 'assets/[name]-[hash][extname]';
          },
        },
      },
      // Transform service worker during build
      watch: null,
    },
  };
});
