(function(ipv) {
    ipv.pop = {
        des: 'dropDown',
        loadData: function(obj) {
            var popObj = ipv.virus.view.popQueue.shift(),
                vtype = document.querySelector('#v-type'),
                vpath = document.querySelector('#v-path'),
                vname = document.querySelector('#v-name'),
                vid = document.querySelector('#v-id');
            if (popObj != 'undefined') {
                vid.innerHTML = popObj.id;
                vtype.innerHTML = popObj.cmd;
                vpath.innerHTML = popObj.displayName;
                vname.innerHTML = popObj.displayVirusName;
            }
        }(ipv),
        closePop: function() {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            win.close();
            win.on('closed', function() {
                console.log('hasclose');
            })
        },
        arrow: function(ele) {
            var cmd = {
                operation: 0
            }
            cmd.id = vid.innerHTML;
            ipv.CLIENT.write(ipv.virus.fmt(cmd));
        },
        prevent: function(ele) {
            var cmd = {
                operation: 1
            }
            cmd.id = vid.innerHTML;
            ipv.CLIENT.write(ipv.virus.fmt(cmd));
        }
    }
    ipv.pop.dropDown = {
        init: function(ele) {
            this.menu = ele.parentNode.querySelector('ul');
            this.toggleMenu(this.menu);

        },
        toggleMenu: function(menu) {
            if (menu.style.display == 'none') {
                menu.style.display = 'block';
            } else {
                menu.style.display = 'none';
            }

        }
    }
    ipv.toolbox.addEvents(document.querySelector('#moreOperation'), 'click', function() { ipv.pop.dropDown.init(this) }, false);
    ipv.toolbox.addEvents(document.querySelector('#pop-close'), 'click', function() { ipv.pop.closePop() }, false);
    ipv.toolbox.addEvents(document.querySelector('#arrow'), 'click', function() { ipv.pop.arrow() }, false);
    ipv.toolbox.addEvents(document.querySelector('#prevent'), 'click', function() { ipv.pop.prevent() }, false);
    // ipv.toolbox.addEvents(window, 'load', function() { ipv.pop.loadData() }, false);
})(global.ipv);