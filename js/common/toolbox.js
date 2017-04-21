ipv.toolbox = {
    // 添加事件
    addEvents: function(obj, evType, fn, useCapture) {

        if (!useCapture) useCapture = false;

        if (!(obj.constructor.name == 'NodeList')) {
            if (obj.addEventListener) {
                obj.addEventListener(evType, fn, useCapture);
            } else {
                obj.attachEvent('on' + evType, fn);
            }
        } else {
            for (var item in obj) {
                if (!isNaN(item)) {
                    if (obj[item].addEventListener) {
                        obj[item].addEventListener(evType, fn, useCapture);
                    } else {
                        obj[item].attachEvent('on' + evType, fn);
                    };
                }
            };
        };
    },

    /**
     * 移除事件
     */
    removeEvent: function(obj, evType, fn, useCapture) {
        if (!useCapture) useCapture = false;

        if (obj.removeEventListener) {
            obj.removeEventListener(evType, fn, useCapture);
        } else {
            obj.detachEvent('on' + evType, fn);
        }
    }
};