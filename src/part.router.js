import _router from './packages/router';
import { createC, createExtend } from './utils/create';

// create cubec
export const router = createC(_router);

// information
router.version = "1.9.19";

// create extend option
router.extend = createExtend(_router);

Object.freeze(router);

export default router;

