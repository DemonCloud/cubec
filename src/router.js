import _router from './packages/router';
import {createC, createExtend} from './utils/create';

const router = createC(_router);
router.extend = createExtend(_router);

export default router;
