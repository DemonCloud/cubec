import _router from './packages/router';
import { createC, createExtend } from './utils/create';

// create cubec
export const router = createC(_router);

// create extend option
createExtend(router, _router);

export default router;

