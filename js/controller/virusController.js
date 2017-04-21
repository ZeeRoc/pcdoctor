ipv.virus = {
    module: 'virus',
    version: 'v0.1',
    COMMAND: {
        CMD_CUSTOM: {
            cmd: 'engine_scancustom',
            locations: []
        },
        CMD_QUICK: {
            cmd: 'engine_scansystem'
        },
        CMD_FULLDISK: {
            cmd: 'engine_scanfulldisks'
        },
        CMD_PAUSE: {
            cmd: 'engine_suspend'
        },
        CMD_RESUME: {
            cmd: 'engine_resume'
        },
        CMD_STOP: {
            cmd: 'engine_stop'
        },
        CMD_REPAIR: {
            cmd: 'engine_repair',
            id: []
        }
    },
    ScanStatus: {
        'custom': '自定义',
        'fulldisk': '全盘',
        'quick': '快速'
    },
    flag: false,
    scanType: '',
    fmt: (CMD) => {
        return JSON.stringify(CMD) + ';\n';
    }
};
ipv.virus.callback = {
    Quick: () => {
        ipv.virus.scanType = 'quick';
        ipv.CLIENT.write(ipv.virus.fmt(ipv.virus.COMMAND.CMD_QUICK));
    },
    Custom: () => {
        ipv.virus.scanType = 'custom';
        console.log(ipv.virus.COMMAND.CMD_CUSTOM);
        ipv.CLIENT.write(ipv.virus.fmt(ipv.virus.COMMAND.CMD_CUSTOM));
    },
    FullDisk: () => {
        ipv.virus.scanType = 'fulldisk';
        ipv.CLIENT.write(ipv.virus.fmt(ipv.virus.COMMAND.CMD_FULLDISK));
    },
    Pause: () => {
        var currentStatus = ipv.virus.view.Pause('get');
        ipv.CLIENT.write((currentStatus == 'normal' ? ipv.virus.fmt(ipv.virus.COMMAND.CMD_PAUSE) : ipv.virus.fmt(ipv.virus.COMMAND.CMD_RESUME)));
    },
    Stop: (opt) => {
        opt = opt || 'normal';
        ipv.virus.view.isCancel = opt;
        ipv.CLIENT.write(ipv.virus.fmt(ipv.virus.COMMAND.CMD_STOP));
    },
    RepairNow: () => {
        console.log(ipv.virus.COMMAND.CMD_REPAIR);
        ipv.CLIENT.write(ipv.virus.fmt(ipv.virus.COMMAND.CMD_REPAIR));
    },
    task_detail: (taskList) => {
        taskList = taskList.toString().split(';');
        taskList.splice(taskList.indexOf('\n'), 1);
        // console.log(taskList);
        for (let item in taskList) {
            var task = JSON.parse(taskList[item].replace('\n', ''));
            switch (task.cmd) {
                case 'engine_fix_started':
                    ipv.virus.view.ViewAdapter({ msg: '正在处理威胁...' });
                    break;
                case 'engine_fix_stoped':
                    ipv.virus.view.ViewAdapter({ msg: '已清除所有威胁', path: ' ' });
                    ipv.virus.view.OpenDetailPage();
                    break;
                case 'engine_after_fix':
                    ipv.virus.view.DetailVirus(task.id);
                    console.log(task.id);
                    break;
                case 'engine_scan_started':
                    ipv.virus.view.StartScanAni(ipv.virus.ScanStatus[ipv.virus.scanType], 'open');
                    break;
                case 'engine_scan_stopped':
                    ipv.virus.view.ProgressBar(0, task.cmd);
                    ipv.virus.view.ScanEnd();
                    break;
                case 'engine_suspended':
                case 'engine_resumed':
                    console.log(task);
                    ipv.virus.view.Pause(task.cmd);
                    break;
                case 'hips_create_process_notify':
                    console.log(task);
                    ipv.virus.view.popQueue.push(task);
                    ipv.virus.view.checkQueue();
                    break;
                default:
                    break;
            };
            if (task.cmd.indexOf('before_detect') >= 0) {
                console.log(task.cmd)
                ipv.virus.view.ProgressBar(0.01, 'normal');
                // console.log(0.1)
                ipv.virus.view.ViewAdapter({ path: task.displayName });
                // ipv.virus.view.dumpScanInfo('QuickScanPath', task.displayName);
            } else {
                if (task.isVirus) {
                    console.log(task);
                    ipv.virus.flag = true;
                    ipv.virus.view.FoundVirus(task);
                }
            }
        }
    }
}