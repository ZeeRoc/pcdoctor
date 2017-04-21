(function(ipv) {
    ipv.virus.view = {
        ScanRes: {
            'remove': '删除文件',
            'disinfection': '清除感染',
            'terminateprocess': '结束进程',
            'terminatethread': '结束线程',
            'custom': '清除威胁'
        },
        timer: null,
        minutes: 0,
        seconds: 1,
        resTitle: document.querySelector('#virus-title'),
        resPath: document.querySelector('#QuickScanPath'),
        scanStatus: null,
        diskList: {},
        fixedCount: 0,
        popTag: false,
        popQueue: [],
        isCancel: 'normal',
        _self: function() {
            return this;
        },
        checkQueue: function() {
            var _self = this;
            console.log(_self.popQueue);

            if (!_self.popTag) {
                _self.OpenWindow();
            }
        },
        /**
         * Open Window
         * @param 
         */
        OpenWindow: function() {
            var gui = require('nw.gui'),
                _self = this,
                WinWidth = 520,
                WinHeight = 345,
                wId = 'PcDoctor - 文件拦截',
                opt = {
                    id: wId,
                    title: wId,
                    position: 'center',
                    width: WinWidth,
                    height: WinHeight,
                    focus: true,
                    show: false,
                    always_on_top: true,
                    frame: false,
                    transparent: true
                },
                winX = window.screen.width - WinWidth,
                winY = window.screen.height - WinHeight - 40;
            var win = gui.Window.open('../gui.pop/pop/pop-model.html', opt, function(w) {
                global.ipv = window.ipv;
                w.x = winX;
                w.y = winY;
                w.show();
                _self.popTag = true;
                w.on('closed', function() {
                    let popQueue = _self.popQueue.length;
                    console.log(_self.popQueue);
                    if (popQueue > 0) {
                        _self.OpenWindow();
                    } else {
                        _self.popTag = false;
                    }
                })
            });

        },

        /**
         *  Detail Timer 
         */
        fixNum: function(num, length) {
            return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
        },

        /**
         * Check All [ Check All checkbox ]
         */
        CheckAll: function(evt) {
            var virusList = document.querySelectorAll('#resList li input'),
                checkLen = 0,
                ScanFix = document.querySelector('#scan-repair');

            for (let item in virusList) {
                if (!isNaN(item)) {
                    if (evt.checked) {
                        virusList[item].checked = true;
                    } else {
                        virusList[item].checked = false;
                    }
                }
            }
            console.log(checkLen)
            checkLen = document.querySelectorAll('#resList input:checked').length;
            if (checkLen < 1) {
                ScanFix.setAttribute('class', 'control-btn disabled');
            } else {
                ScanFix.setAttribute('class', 'control-btn');
            }
        },
        checkFixState: function(ele) {
            var checkLen = ele.parentNode.parentNode.querySelectorAll('input:checked').length,
                nodeLen = ele.parentNode.parentNode.querySelectorAll('input').length,
                checkAll = document.querySelector('#checkAll'),
                ScanFix = document.querySelector('#scan-repair');
            console.log(checkLen, nodeLen)
            if (checkLen >= nodeLen) {
                checkAll.checked = true;
            } else {
                checkAll.checked = false;
            }
            if (checkLen < 1) {
                ScanFix.setAttribute('class', 'control-btn disabled');
            } else {
                ScanFix.setAttribute('class', 'control-btn');
            }
        },
        /**
         * Fix Now [ Fix has checked item ]
         */
        RepairNow: function() {
            console.log(this);
            var virusList = document.querySelectorAll('#resList li input'),
                repairList = [];
            for (let item in virusList) {
                if (!isNaN(item)) {
                    if (virusList[item].checked) {
                        repairList.push(virusList[item].id.split('_')[1]);
                    }
                }
            };
            ipv.virus.COMMAND.CMD_REPAIR.id = repairList;
            ipv.virus.callback.RepairNow();
        },

        /**
         * Change Scan Status Text 
         */
        ViewAdapter: function(content) {
            if (content.path == '') return -1;
            var _self = this;
            if (content.msg) {
                _self.resTitle.innerHTML = content.msg;
            }
            if (content.path) {
                _self.resPath.innerHTML = content.path;
            }
        },

        /**
         * Scan End [ Change Status Text ]
         */
        ScanEnd: function() {
            operation = ipv.virus.view.isCancel;
            var virusNum = document.querySelector('#virus-num'),
                virusTips = document.querySelector('#virus-tips'),
                checkAll = document.querySelector('#checkAll');
            this.timeWatch('clear');
            checkAll.disabled = false;
            if (virusNum.innerHTML > 0) {
                this.resTitle.innerHTML = '已发现 ' + virusNum.innerHTML + ' 个威胁，请立即处理！';
                this.Repair('se');
            } else {
                if (operation == 'force') {
                    this.StartScanAni('None', 'close');
                    virusTips.innerHTML = virusTips.innerHTML.replace('受保护中', '杀毒已取消');
                    setTimeout(function() {
                        ipv.virus.view.isCancel = 'normal';
                        virusTips.innerHTML = virusTips.innerHTML.replace('杀毒已取消', '受保护中');
                    }, 5000)
                } else {
                    this.resTitle.innerHTML = '暂未发现任何威胁！';
                    this.OpenDetailPage();
                }

            }
            this.resPath.innerHTML = '';
        },

        /**
         * Open Detail Page
         */
        OpenDetailPage: function(operation) {
            var _self = ipv.virus.view,
                detailPage = document.querySelector('#detail-page'),
                fixRes = document.querySelector('#fixRes'),
                fixResTag = document.querySelector('#fixResTag'),
                parentPage = detailPage.parentNode;
            operation = operation || null;
            if (operation == 'close') {
                detailPage.style.transform = 'translate(0px, -458px)';
                return 1;
            }
            if (_self.fixedCount > 0) {
                fixRes.innerHTML = '成功处理' + _self.fixedCount + '个威胁！';
                _self.fixedCount = 0;
            } else {
                fixRes.innerHTML = '扫描完成，无风险项！';
            }
            fixResTag.innerHTML = ipv.virus.ScanStatus[ipv.virus.scanType] + '扫描';
            detailPage.style.transform = 'translate(0px, 0px)';
            this.Repair('fe');

        },

        /**
         * Fix Virus [ Remove has fixed item ]
         */
        DetailVirus: function(ele) {
            try {
                var list = document.querySelector('#resList'),
                    vNum = document.querySelector('#virus-num'),
                    fixEle = document.querySelector('#uuid_' + ele).parentNode,
                    vPath = fixEle.querySelector('p').innerHTML;
                this.ViewAdapter({ path: vPath });
                list.removeChild(fixEle);
                this.fixedCount++;
                vNum.innerHTML = list.childElementCount - 1;
                if (list.childElementCount <= 1) {
                    list.querySelector('h5').style.display = 'block';
                }
            } catch (e) {
                console.log(e)
            }

        },

        /**
         * Start Scan Animation
         */
        StartScanAni: function(status, operation) {
            var _self = this;
            ScanPause = document.querySelector('#scan-pause');
            _self.scanStatus = status;
            _self.resTitle.innerHTML = '正在进行' + status + '扫描...';
            var virusModule = document.querySelector('#virusModule'),
                detailModule = document.querySelector('#detailModule'),
                scanDetail = document.querySelector('#scanDetail'),
                scanInfo = document.querySelector('#scanInfo'),
                scanResult = document.querySelector('#scanResult'),
                progress = document.querySelector('#progress'),
                startScanContainer = document.querySelector('#startScanContainer'),
                currentSection = document.querySelectorAll('section')[1],
                checkAll = document.querySelector('#checkAll');
            if (operation == 'open') {
                // if (currentSection.getAttribute('data-status') == 'normal') {
                this.timeWatch('stop');
                this.timeWatch('time');
                currentSection.setAttribute('data-status', 'scanning');
                virusModule.style.height = '20%';
                detailModule.style.height = '80%';
                scanInfo.style.display = 'none';
                startScanContainer.style.display = 'none';
                scanDetail.style.display = 'block';
                scanResult.style.display = 'block';
                progress.style.display = 'block';
                checkAll.disabled = true;
                checkAll.checked = true;

            } else {
                this.timeWatch('stop');
                // this.ProgressBar(0, 'end');
                checkAll.disabled = false;
                this.fixedCount = 0;
                ScanPause.setAttribute('data-status', 'normal');
                ScanPause.innerHTML = '暂停';
                document.querySelector('#scan-time').innerHTML = '00:00';
                currentSection.setAttribute('data-status', 'normal');
                virusModule.removeAttribute('style');
                detailModule.removeAttribute('style');
                scanInfo.removeAttribute('style');
                startScanContainer.removeAttribute('style');
                scanDetail.removeAttribute('style');
                scanResult.removeAttribute('style');
                progress.removeAttribute('style');
            }
        },
        /**
         * ReScan
         */
        ReScan: function() {
            var scanType = ipv.virus.scanType;
            ipv.virus.view.OpenDetailPage('close');
            ipv.virus.view.NoDetail('re');
            switch (scanType) {
                case 'quick':
                    ipv.virus.callback.Quick();
                    break;
                case 'custom':
                    ipv.virus.callback.Custom();
                    break;
                case 'fulldisk':
                    ipv.virus.callback.FullDisk();
                    break;
            }
        },
        /**
         * Detail No [ Return Main View ]
         */
        NoDetail: function(type) {

            var _self = ipv.virus.view,
                resList = document.querySelector('#resList'),
                child = resList.querySelectorAll('li'),
                virusNum = document.querySelector('#virus-num'),
                tips = resList.querySelector('h5');
            for (let i = 0; i < child.length; i++) {
                resList.removeChild(child[i]);
            };
            tips.style.display = 'block';
            virusNum.innerHTML = '0';
            _self.Repair();
            if (type == 're') {
                return -1;
            }
            _self.StartScanAni('None', 'close');
        },

        /**
         * Scan Time 
         */
        timeWatch: function(operation) {
            var _self = this;
            if (operation == 'clear') {
                clearInterval(_self.timer);
            } else if (operation == 'stop') {
                clearInterval(_self.timer);
                _self.minutes = 0;
                _self.seconds = 0;
            } else {
                _self.timer = setInterval(function() {
                    let time = document.querySelector('#scan-time');
                    time.innerHTML = _self.fixNum(_self.minutes, 2) + ':' + _self.fixNum(_self.seconds, 2);
                    _self.seconds++;
                    if (_self.seconds >= 60) {
                        _self.seconds = 0;
                        _self.minutes++;
                    };
                }, 1000)
            }
        },

        /**
         * progress bar
         */
        ProgressBar: function(schedule, state) {
            var progress = document.querySelector('#progress-now');

            if (state == 'engine_scan_stopped') {
                schedule = 100;
            } else {

                if (Number(progress.style.width.replace('%', '')) >= 100) {
                    progress.style.width = '0%'
                }
                if (Number(progress.style.width.replace('%', '')) > 93) {
                    return -1;
                }
                schedule = progress.getAttribute('style') ? Number(progress.style.width.replace('%', '')) + schedule : 0;
            }
            progress.style.width = schedule + '%';
        },

        /**
         * Scan Pause 
         */
        Pause: function(operation) {
            operation = operation || 'get';
            var ScanPause = document.querySelector('#scan-pause'),
                _self = this,
                Status = ScanPause.getAttribute('data-status');
            if (operation == 'get') {
                return Status;
            } else if (operation == 'engine_suspended') {
                _self.timeWatch('clear');
                ScanPause.setAttribute('data-status', 'pause');
                _self.resTitle.innerHTML = '杀毒已暂停...'
                ScanPause.innerHTML = '继续';
            } else if (operation == 'engine_resumed') {
                this.timeWatch('time');
                ScanPause.setAttribute('data-status', 'normal');
                ScanPause.innerHTML = '暂停';
                _self.resTitle.innerHTML = '正在进行' + _self.scanStatus + '杀毒...';
            };
        },

        /**
         * Found Virus [ Add virus to List ]
         */
        FoundVirus: function(virusObj) {
            console.log(virusObj)
            if (virusObj.displayName == "") {
                return -1;
            }
            var li = document.createElement('li'),
                virusNum = document.querySelector('#virus-num'),
                resList = document.querySelector('#resList');
            li.innerHTML = '<input type="checkbox" checked class="hide" id="uuid_' + virusObj.id + '" name="virusItem" value=""><label for="uuid_' + virusObj.id + '">' + virusObj.displayVirusName + '</label><a href="##" class="detail-info">详情</a>\
                            <div class="f-r"><a href="##" class="res-control no-op">' + ipv.virus.view.ScanRes[virusObj.operation.toLowerCase()] + '</a><a href="##" class="res-control">信任</a></div>\
                            <p class="virus-path" title="文件路径：' + virusObj.displayName + '">路径：' + virusObj.displayName + '</p>';
            // console.log('find v')
            if (resList.children[0].nodeName == 'H5') {
                resList.children[0].style['display'] = 'none';
            };
            resList.appendChild(li);
            virusNum.innerHTML = resList.childElementCount - 1;
            ipv.toolbox.addEvents(li.querySelector('input'), 'click', function() {
                ipv.virus.view.checkFixState(this);
            }, false);
        },

        /**
         * Change Button Status
         */
        Repair: function(operation) {
            try {
                operation = operation || 'clear';
                var ScanPause = document.querySelector('#scan-pause'),
                    ScanStop = document.querySelector('#scan-stop'),
                    FixNo = document.querySelector('#scan-repair-no'),
                    ScanFix = document.querySelector('#scan-repair'),
                    ScanTime = document.querySelector('#ScanTime'),
                    ScanReStart = document.querySelector('#scan-re-start'),
                    ScanReturn = document.querySelector('#scan-return');
                if (operation == 'se') {
                    ScanPause.setAttribute('class', 'control-btn hide');
                    ScanStop.setAttribute('class', 'control-btn hide');
                    FixNo.setAttribute('class', 'control-btn');
                    ScanFix.setAttribute('class', 'control-btn');
                    ScanReStart.setAttribute('class', 'control-btn hide');
                    ScanReturn.setAttribute('class', 'control-btn hide');
                } else if (operation == 'fe') {
                    ScanPause.setAttribute('class', 'control-btn hide');
                    ScanStop.setAttribute('class', 'control-btn hide');
                    FixNo.setAttribute('class', 'control-btn hide');
                    ScanFix.setAttribute('class', 'control-btn hide');
                    ScanReStart.setAttribute('class', 'control-btn');
                    ScanReturn.setAttribute('class', 'control-btn');
                } else {
                    ScanPause.setAttribute('class', 'control-btn');
                    ScanStop.setAttribute('class', 'control-btn');
                    FixNo.setAttribute('class', 'control-btn hide');
                    ScanFix.setAttribute('class', 'control-btn hide');
                    ScanReStart.setAttribute('class', 'control-btn hide');
                    ScanReturn.setAttribute('class', 'control-btn hide');
                }
                // this.ScanEnd();
            } catch (error) {
                console.log(error)
            }
        },

        /**
         * Restart Scan
         */
        ReStartScan: function() {
            var _self = ipv.virus.view;
            _self.StartScanAni('None', 'open');
        },

        /**
         * Return Main View
         */
        End: function() {
            var _self = ipv.virus.view;
            _self.OpenDetailPage('close');
            _self.NoDetail();
        },
        TreeSelect: function(evt) {
            console.log(evt)
        },

        /**
         * Get Disk List
         */
        GetCustomWindow: function(operation) {
            var exec = require('child_process').exec,
                il = require('iconv-lite'),
                customPath = document.querySelector('#custom-path'),
                modalBg = document.querySelectorAll('.modal-bg'),
                status = false,
                _self = this;
            if (operation != 'open') {
                status = 'none';
                customPath.style.transform = 'scale(0)';
                for (let i = 0; i < modalBg.length; i++) {
                    modalBg[i].style.display = status;
                }
                return -1;
            } else {
                // ipv.virus.view.Tree.LoadTree('/');
                status = 'block';
                // customPath.style.transform = 'scale(1)';
                for (let i = 0; i < modalBg.length; i++) {
                    modalBg[i].style.display = status;
                }
            }

            // show  Windows letter, to compatible Windows xp
            var wmicResult;
            var command = exec('wmic logicaldisk get Caption,VolumeName', { encoding: 'binary' }, function(err, stdout, stderr) {
                if (err || stderr) {
                    console.log("root path open failed" + err + stderr);
                    return;
                }
                // console.log(err, il.decode(stdout, 'gbk'), stderr)
                wmicResult = il.decode(stdout, 'gbk');
            });
            // stop the input pipe, in order to run in windows xp
            command.stdin.end();
            command.on('close', function(code) {
                var data = wmicResult.split('\n');
                for (let items in data) {
                    if (data[items].indexOf(':') > -1) {
                        var v = data[items].split(':')[1].trim() == "" ? "本地磁盘" : data[items].split(':')[1].trim();
                        ipv.virus.view.diskList[data[items].split(':')[0]] = v;
                        console.log(ipv.virus.view.diskList)
                    }
                }
                // ipv.virus.view.GetDisk();
                if (operation == 'open') {
                    ipv.virus.view.Tree.LoadTree('/');
                    // status = 'block';
                    customPath.style.transform = 'scale(1)';
                }
                // for (let i = 0; i < modalBg.length; i++) {
                //     modalBg[i].style.display = status;
                // }
                // add event to tree 
                ipv.toolbox.addEvents(document.querySelectorAll('#treeSelect a'), 'click', function() {
                    ipv.virus.view.Tree.ToggleTree(this);
                }, false);
                ipv.toolbox.addEvents(document.querySelectorAll('#treeSelect input'), 'click', function() {
                    console.log(this);
                    ipv.virus.view.Tree.ChangeCheck(this);
                }, false);
            });
        },
        /**
         * Open Custom Scan Window
         */
        // GetCustomWindow: function(operation) {
        //     var customPath = document.querySelector('#custom-path'),
        //         modalBg = document.querySelectorAll('.modal-bg'),
        //         status = false;
        //     ipv.virus.view.GetDisk();
        //     if (operation == 'open') {
        //         ipv.virus.view.Tree.LoadTree('/');
        //         status = 'block';
        //         customPath.style.transform = 'scale(1)';

        //     } else {
        //         status = 'none';
        //         customPath.style.transform = 'scale(0)';
        //     };
        //     for (let i = 0; i < modalBg.length; i++) {
        //         modalBg[i].style.display = status;
        //     }
        //     // add event to tree 
        //     ipv.toolbox.addEvents(document.querySelectorAll('#treeSelect a'), 'click', function() {
        //         ipv.virus.view.Tree.ToggleTree(this);
        //     }, false);
        //     ipv.toolbox.addEvents(document.querySelectorAll('#treeSelect input'), 'click', function() {
        //         console.log(this);
        //         ipv.virus.view.Tree.ChangeCheck(this);
        //     }, false);
        // }
    };
    ipv.virus.view.Tree = {
        Init: function() {
            console.log(ipv.virus.view.diskList);
        },
        ToggleTree: function(evt) {
            var _self = this;
            var flag = false;

            var nodes = evt.parentNode.childNodes;
            for (let node in nodes) {
                if (nodes[node].nodeName == 'UL') {
                    flag = true;
                    if (getComputedStyle(nodes[node], 'style').display == 'none') {
                        nodes[node].style.display = 'block';
                    } else {
                        nodes[node].style.display = 'none';
                    }
                }
            }
            if (!flag) {
                _self.LoadTree(evt);
            }
        },
        LoadTree: function(evt) {
            var path;
            if (!(typeof(evt) == 'string')) {
                path = evt.getAttribute('data-path');
            } else {
                path = evt;
            }
            console.log(path);
            if (path == '/') {
                var diskList = ipv.virus.view.diskList,
                    tmplate = '',
                    eleDiskList = document.querySelector('#treeSelect');
                for (var item in diskList) {
                    tmplate += '<li><input type="checkbox" data-path="' + item + ':\\" class="hide" id="' + item + '" name="b3" value=""><label for="' + item + '"></label><a href="###" data-path="' + item + ':">' + diskList[item] + '&nbsp;&nbsp;(' + item + ':)</a></li>';
                }
                eleDiskList.innerHTML = tmplate;

                // console.log(tmplate)

            } else {
                var fs = require('fs');
                var files = fs.readdirSync(path);
                var ul = document.createElement('ul');
                var tmplate = '';
                var isCheck = '';
                console.log(evt)
                var child = evt.parentNode.childNodes;
                for (let item in child) {
                    if (child[item].nodeName == 'INPUT') {
                        if (child[item].checked) {
                            isCheck = 'checked';
                            console.log(child[item].checked)
                        }
                    }
                }
                files.forEach(function(fa) {
                    try {
                        if (fs.statSync(path + '\\' + fa).isDirectory()) {
                            tmplate += '<li><input type="checkbox" ' + isCheck + ' data-path="' + path + '\\' + fa + '" class="hide" id="' + path + '\\' + fa + '" name="b3" value=""><label for="' + path + '\\' + fa + '"></label><a href="###" data-path="' + path + '\\' + fa + '">' + fa + '</a></li>';
                        }
                    } catch (e) {
                        console.log(e);
                    }
                    ul.innerHTML = tmplate;
                    evt.parentNode.appendChild(ul);
                })
                for (let item in ul.childNodes) {
                    if (ul.childNodes[item].nodeName == 'LI') {
                        ipv.toolbox.addEvents(ul.childNodes[item].querySelectorAll('a'), 'click', function() {
                            ipv.virus.view.Tree.ToggleTree(this);
                        }, false);
                        ipv.toolbox.addEvents(ul.childNodes[item].querySelectorAll('input'), 'click', function() {
                            ipv.virus.view.Tree.ChangeCheck(this);
                        }, false);
                    }
                }

            }
        },
        GetCheckDisk: function() {
            var checkList = document.querySelectorAll('#treeSelect input:checked'),
                hasCheck = [];
            for (let i = 0; i < checkList.length; i++) {
                if (!checkList[i].parentNode.parentNode.parentNode.querySelector('input').checked) {
                    hasCheck.push(checkList[i].getAttribute('data-path'))
                }
            };
            ipv.virus.COMMAND.CMD_CUSTOM.locations = hasCheck;
            ipv.virus.callback.Custom();
            ipv.virus.view.GetCustomWindow('close');
        },
        ChangeCheck: function(ele) {
            var child = ele.parentNode.childNodes,
                isCheck = false;
            for (let item in child) {
                if (child[item].nodeName == 'INPUT') {
                    let pNode = child[item].parentNode.parentNode,
                        pNodes = pNode.parentNode,
                        currentLen = pNode.querySelectorAll('input').length,
                        checkLen = pNode.querySelectorAll('input:checked').length;
                    console.log(ele.parentNode.parentNode.id)
                    if (ele.parentNode.parentNode.id != 'treeSelect') {
                        if (currentLen == checkLen) {
                            pNodes.querySelector('input').setAttribute('check-status', true);
                            pNodes.querySelector('input').checked = true;
                        } else {
                            pNodes.querySelector('input').setAttribute('check-status', false);
                            pNodes.querySelector('input').checked = false;
                        }
                    }

                    if (child[item].checked) {
                        isCheck = true;
                    } else {
                        isCheck = false;
                    }
                }
                if (child[item].nodeName == 'UL') {
                    let inputs = child[item].querySelectorAll('input');
                    for (let ipt in inputs) {
                        if (isNaN(inputs[ipt])) {
                            inputs[ipt].checked = isCheck;
                        }
                    }
                }
            }
        }
    };
})(ipv);