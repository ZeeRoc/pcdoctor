// QuickScan
ipv.toolbox.addEvents(document.querySelector('#scanSystem'), 'click', ipv.virus.callback.Quick, false);

// New Custom
// ipv.toolbox.addEvents(document.querySelector('#scanCustom'), 'click', ipv.virus.callback.Custom, false);

// Pause/Resume
ipv.toolbox.addEvents(document.querySelector('#scan-pause'), 'click', ipv.virus.callback.Pause, false);

// Stop
ipv.toolbox.addEvents(document.querySelector('#scan-stop'), 'click', function() {
    ipv.virus.callback.Stop('force')
}, false);

// CheckBox
ipv.toolbox.addEvents(document.querySelector('#checkAll'), 'click', function() { ipv.virus.view.CheckAll(this) }, false);

// Repair
ipv.toolbox.addEvents(document.querySelector('#scan-repair'), 'click', ipv.virus.view.RepairNow, false);

// No Detail
ipv.toolbox.addEvents(document.querySelector('#scan-repair-no'), 'click', function() { ipv.virus.view.NoDetail() }, false);

// Custom
ipv.toolbox.addEvents(document.querySelector('#scanCustom'), 'click', function() {
    ipv.virus.view.GetCustomWindow('open');
}, false);

// Close Custom Window
ipv.toolbox.addEvents(document.querySelector('#custom-close'), 'click', function() {
    ipv.virus.view.GetCustomWindow('close');
}, false);

// FullDisk
ipv.toolbox.addEvents(document.querySelector('#scanFullDisk'), 'click', ipv.virus.callback.FullDisk, false);

// Return [ has repair ]
ipv.toolbox.addEvents(document.querySelector('#scan-return'), 'click', ipv.virus.view.End, false);

ipv.toolbox.addEvents(document.querySelectorAll('#Start'), 'click', function() {
    ipv.virus.view.Tree.GetCheckDisk();
}, false);

// ReScan
ipv.toolbox.addEvents(document.querySelectorAll('#scan-re-start'), 'click', function() {
    ipv.virus.view.ReScan();
}, false);