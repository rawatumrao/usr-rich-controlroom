# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# Instructions to run locally

1. install pnpm as the node_module downloader 

    To install pnpm follow instructions on this webpage [pnpm](https://pnpm.io/installation) 

2. install the node modules

    To install the node_modules run in terminal / command prompt run 'pnpm install'

3. Change to dev enviroment variable

    In '/contexts/constants.js' on line 8 change ENV to ENVIRONMENT.dev for local development.

4. Run local commands

    In terminal / command prompt use 'pnpm run dev' to run locally

5. Go to app in a web browser 
  
    Open webpage with localhost url http://localhost:5173/

# Instructions to run in Prod

1. install pnpm as the node_module downloader 

    To install pnpm follow instructions on this webpage [pnpm](https://pnpm.io/installation) 

2. install the node modules

    To install the node_modules run in terminal / command prompt run 'pnpm install'

3. Change to prod enviroment variable

    In '/contexts/constants.js' on line 8 change ENV to ENVIRONMENT.prod for production delpoy.

4. Build new build

    In terminal / command prompt run 'pnpm run build'

5. JS file go to './dist/assets/index.js

    Take the built index.js and copy and paste it into 
    
    '/web/admin/videobridge/3502/list_frame/assets/index.js'

6. CSS file go to './dist/assets/index.css

    Take the built index.css and copy and paste it into 
    
    '/web/admin/videobridge/3502/list_frame/assets/index.css'