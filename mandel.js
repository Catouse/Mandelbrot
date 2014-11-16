(function(window, document)
{
    var Mandel = function()
    {
    };

    Mandel.prototype.init = function()
    {
        var that = this;

        this.workersCount = 8;
        this.workers = [];
        this.generation = 0;
        this.nextRow = 0;

        this.canvas = document.getElementById('mandel');
        this.mandelLib = new MandelLib(this.canvas);

        this.canvas.onclick = function(event)
        {
            that.handleClick(event.clientX, event.clientY);
        };

        window.onresize = function(){that.resizeToWindow();};

        // Create all workers
        var onProcessWork = function(event)
        {
            that.processWork(event.target, event.data);
        };
        for(var i = 0; i < that.workersCount; i++)
        {
            var worker = new Worker('worker.js');

            worker.onmessage = onProcessWork;

            worker.idle = true;
            that.workers.push(worker);
        }

        that.startWorkers();
    };

    Mandel.prototype.reassignWorker = function(worker)
    {
        var row = this.nextRow++;
        if(row >= this.canvas.height)
        {
            worker.idle = true;
        }
        else
        {
            var task = this.mandelLib.createTask(row);
            worker.idle = false;
            worker.postMessage(task);
        }
    };

    Mandel.prototype.processWork = function(worker, workerResults)
    {
        if(workerResults.generation === this.generation)
        {
            this.mandelLib.drawRow(workerResults);
        }

        this.reassignWorker(worker);
    };

    Mandel.prototype.startWorkers = function()
    {
        this.generation++;
        this.nextRow = 0;
        for(var i = 0; i < this.workers.length; i++)
        {
            var worker = this.workers[i];
            if(worker.idle)
            {
                var task = this.mandelLib.createTask(this.nextRow);
                worker.idle = false;
                worker.postMessage(task);
                this.nextRow++;
            }
        }
    };

    Mandel.prototype.resizeToWindow = function()
    {
        var canvas = this.canvas;
        var lib = this.mandelLib;

        var width = ((lib.iMax - lib.iMin) * canvas.width / canvas.height);
        var rMid = (lib.rMax + lib.rMin) / 2;
        lib.rMin = rMid - width/2;
        lib.rMax = rMid + width/2;
        lib.rowData = lib.ctx.createImageData(canvas.width, 1);

        this.startWorkers();
    };

    Mandel.prototype.handleClick = function(x, y)
    {
        var lib = this.mandelLib;
        var width = lib.rMax - lib.rMin;
        var height = lib.iMin - lib.iMax;
        var clickR = lib.rMin + ((width * x) / this.canvas.width);
        var clickI = lib.iMax + ((height * y) / this.canvas.height);

        var zoom = 8;

        lib.rMin = clickR - width/zoom;
        lib.rMax = clickR + width/zoom;
        lib.iMax = clickI - height/zoom;
        lib.iMin = clickI + height/zoom;

        this.startWorkers();
    };

    var mandel = new Mandel();

    window.onload = function()
    {
        mandel.init();
    };
}(window, document));
