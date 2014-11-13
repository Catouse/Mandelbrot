(function(window)
{
    var canvas,

        iMax = 1.5,
        iMin = -1.5,
        rMax = 1.5,
        rMin = -2.5,
        
        iterMax = 1024,
        escape = 1025;

    var MandelLib = function(canvas)
    {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        var width = ((iMax - iMin) * canvas.width / canvas.height);
        var rMid = (rMax + rMin) / 2;
        rMin = rMid - width/2;
        rMax = rMid + width/2;

        this.rowData = this.ctx.createImageData(canvas.width, 1);

        this.makePalette();
    };

    MandelLib.prototype.createTask = function(row, generation)
    {
        var task = 
        {
            row        : row,
            width      : this.rowData.width,
            generation : generation,
            rMin       : rMin,
            rMax       : rMax,
            i          : iMax + (iMin - iMax) * row / canvas.height,
            iterMax    : iterMax,
            escape     : escape
        };

        return task;
    };

    MandelLib.prototype.makePalette = function()
    {
        var palette = [];
        var wrap = function(x)
        {
            x = ((x + 256) & 0x1ff) - 256;
            if (x < 0) x = -x;
            return x;
        };

        for (var i = 0; i <= iterMax; i++)
        {
            palette.push([wrap(7*i), wrap(5*i), wrap(11*i)]);
        }

        this.palette = palette;
    };

    MandelLib.prototype.drawRow = function(workerResults)
    {
        var values = workerResults.values;
        var pixelData = this.rowData.data;

        for(var i = 0; i < this.rowData.width; i++)
        {
            var red   = i*4,
                green = i*4 + 1,
                blue  = i*4 + 2,
                alpha = i*4 + 3;

            pixelData[alpha] = 255;

            if(values[i] < 0)
            {
                pixelData[red] = pixelData[green] = pixelData[blue] = 0;
            }
            else
            {
                var color = this.palette[values[i]];
                
                pixelData[red]   = color[0];
                pixelData[green] = color[1];
                pixelData[blue]  = color[2];
            }
        }

        this.ctx.putImageData(this.rowData, 0, workerResults.row);
    };

    window.MandelLib = MandelLib;
}(window));
