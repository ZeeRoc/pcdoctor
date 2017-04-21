(function(win, doc, unf) {

    'use strict';

    ipv.view = {
        closeWin: function() {
            win.close();
        },
        /**
         *  切换侧边栏
         */
        modeState: function() {
            var aside = doc.querySelector('#aside'),
                container = doc.querySelector('#container'),
                header = doc.querySelector('#header'),
                minify = doc.querySelector('#minify'),
                cuurentWidth = Math.ceil(parseInt(getComputedStyle(aside, null).width) / 900 * 100);

            if (cuurentWidth >= 15) {
                minify.style.transform = 'rotate(180deg)';
                aside.style.width = '5.9%';
                header.style.left = '5.9%';
                header.style.width = '94.1%';
                container.style.width = '94.1%';

            } else {
                minify.style.transform = 'rotate(0deg)';
                aside.style.width = '15%';
                header.style.left = '15%';
                header.style.width = '85%';
                container.style.width = '85%';

            }

        },
        /**
         *  切换模块
         */
        togglePage: function(ele) {

            var tagId = ele.id,
                section = doc.querySelectorAll('section');

            for (var tag in section) {
                if (isNaN(tag)) {
                    continue;
                }
                section[tag].style.webkitTransform = 'translate(0,0)';

                section[tag].style.transition = 'transform linear .15s .15s';

                if (section[tag].getAttribute('data-tag') == ele.id) {
                    section[tag].style.transition = 'transform linear .15s';
                    section[tag].style['-webkit-transform'] = 'translate(0,-600px)';
                }
            }
        },


    };

}(window, document, undefined));