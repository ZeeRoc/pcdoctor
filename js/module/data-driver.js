(function(win) {
    var ipv = {
        HOST: '127.0.0.1',
        PORT: 60020,
        NET: require('net'),
        CLIENT: null,
        taskList: ''
    };
    ipv.stream = {
        Socket: function() {
            ipv.CLIENT = new ipv.NET.Socket();
            var client = ipv.CLIENT;
            client.connect(ipv.PORT, ipv.HOST, function() {
                ipv.callback.connect(ipv.HOST, ipv.PORT)
            });
            client.on('data', function(data) {
                ipv.callback.onData(data);
                // client.destroy();
            });
            client.on('close', function(e) {
                ipv.callback.onClose(e);
            });
            client.on('error', function(e) {
                ipv.callback.onError(e);
            });
        }()
    };
    ipv.callback = {
        connect: (port, host) => {
            console.log('CONNECTED TO: ' + ipv.HOST + ':' + ipv.PORT);
        },
        onData: (data) => {
            ipv.virus.callback.task_detail(data);
        },
        onClose: (evt) => {
            console.log('Connection Closed : ' + e);
        },
        onError: (err) => {
            console.log('Connection Error : ' + err);
        }
    }
    win.ipv = ipv;
})(window);