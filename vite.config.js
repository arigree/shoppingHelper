import {defineConfig} from 'vite';
import {resolve} from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
        input: {
            main: resolve(__dirname, 'index.html'),
            home: resolve(__dirname, 'src/pages/home.html'),
            profile: resolve(__dirname, 'src/pages/profile.html'),
            shoppingList: resolve(__dirname, 'src/pages/shopping-list.html'),
            signup: resolve(__dirname, 'src/pages/signup.html'),
            login: resolve(__dirname, 'src/pages/login.html'),  
            product: resolve(__dirname, 'src/pages/product.html'),
            
        }
    }
  }
});