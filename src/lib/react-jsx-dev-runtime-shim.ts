/** Vite dev の CJS 変換で jsx-dev-runtime が壊れる場合のフォールバック */
export { Fragment, jsx as jsxDEV, jsxs as jsxDEV } from 'react/jsx-runtime';
