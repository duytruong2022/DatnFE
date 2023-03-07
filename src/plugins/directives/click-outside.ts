/* eslint-disable @typescript-eslint/no-explicit-any */
const clickEventType = () => {
    return document.ontouchstart !== null ? 'click' : 'touchstart';
};

const UNIQUE_ID = '__vue-click-outside__';

const onMounted = (el: any, binding: any, vnode: any) => {
    onUnmounted(el);

    const vm = vnode.context;
    const callback = binding.value;

    let nextTick = false;
    setTimeout(function () {
        nextTick = true;
    }, 0);

    el[UNIQUE_ID] = (event: any) => {
        if (
            (!el || !el.contains(event.target)) &&
            callback &&
            nextTick &&
            typeof callback === 'function'
        ) {
            return callback.call(vm, event);
        }
    };

    document.addEventListener(clickEventType(), el[UNIQUE_ID], false);
};

const onUnmounted = (el: any) => {
    document.removeEventListener(clickEventType(), el[UNIQUE_ID], false);
    delete el[UNIQUE_ID];
};

const onUpdated = (el: any, binding: any, vnode: any) => {
    if (binding.value === binding.oldValue) {
        return;
    }
    onMounted(el, binding, vnode);
};

export default {
    mounted: onMounted,
    updated: onUpdated,
    unmounted: onUnmounted,
};
