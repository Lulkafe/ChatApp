/* Change this when testing locally */
const IS_THIS_LOCAL_TEST = false;
const PORT = 8080
const backendDebug = `http://localhost:${PORT}`;
const backendProd = 'https://s-chat-backend.onrender.com';

/* Used for React Router navigation */
const rootDebug = '/';
const rootProd = '/ChatApp/';

export const backendDomain = IS_THIS_LOCAL_TEST? backendDebug : backendProd;
export const rootPath = IS_THIS_LOCAL_TEST?  rootDebug : rootProd;