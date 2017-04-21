// 收缩菜单
ipv.toolbox.addEvents(document.querySelector('#minify'), 'click', ipv.view.modeState, false);

// 关闭窗口
ipv.toolbox.addEvents(document.querySelector('#closeWin'), 'click', ipv.view.closeWin, false);

// 模块切换（Section）
ipv.toolbox.addEvents(document.querySelectorAll('.section'), 'click', function() {
    ipv.view.togglePage(this);
}, false);

// 禁止拖拽
ipv.toolbox.addEvents(document.querySelectorAll('a'), 'dragstart', function(e) {

    e.preventDefault();

}, false);