# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Integración con microservicios

Este frontend usa `/api` del mismo origen: Vite lo redirige a `localhost:8080` en desarrollo y Nginx a `gateway:8080` en Docker. La aplicación completa se inicia desde el Compose de la raíz; consulta el README principal. JWT solo en memoria, sin contraseñas ni datos de negocio en localStorage. El único identificador de navegador guardado es el UUID de invitado en sessionStorage. Recargar cierra la sesión. No hay cobro real: las órdenes quedan pendientes de pago.
