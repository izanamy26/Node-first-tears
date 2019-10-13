var fs = require('fs');


/*const colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    fg: {
     Black: "\x1b[30m",
     Red: "\x1b[31m",
     Green: "\x1b[32m",
     Yellow: "\x1b[33m",
     Blue: "\x1b[34m",
     Magenta: "\x1b[35m",
     Cyan: "\x1b[36m",
     White: "\x1b[37m",
     Crimson: "\x1b[38m" //القرمزي
    },
    bg: {
     Black: "\x1b[40m",
     Red: "\x1b[41m",
     Green: "\x1b[42m",
     Yellow: "\x1b[43m",
     Blue: "\x1b[44m",
     Magenta: "\x1b[45m",
     Cyan: "\x1b[46m",
     White: "\x1b[47m",
     Crimson: "\x1b[48m"
    }
   };
   console.log(colors.bg.Blue, colors.fg.White , "I am white message with blue background", colors.Reset) ;*/


fs.readFile('instructions.txt', function (err, logData) {
	if (err) throw err;

    var text = logData.toString().split("\r\n");

    console.log(text);

    let figures = text.reduce((prev, item) => {
        let [figure, x, y, ...params] = item.split(' ');
        x = Number(x);
        y = Number(y);
    
         switch (figure) {
             case 'rect':
                 let [width, height, colorRect, filled] = params;
                 width = Number(width);
                 height = Number(height);
                 prev.push(getRect( x, y, width, height, colorRect, filled ));
                 break;

            case 'line':
                let [length, position, colorLine] = params;
                length = Number(length);
                prev.push(getLine( x, y, length, position, colorLine ));
                break;  
                
            case 'text':
                let [colorText, ...text] = params;
                text = text.join(' ');
                prev.push(getText( x, y, text, colorText ));
                break;    
         }  
        return prev;
    }, []);

    //console.log('FIGURES : ');
    //console.log(figures);

    var canvas = joinCanvases(figures);

    console.log(canvas);

    //console.log('\x1b[46m', 'I am cyan');  //cyan

});

function getRect( x, y, width, height, color, filled ) {
    let canvas = [];

    for (let i = 0; i <= y + height; i++) {
       let row = Array(width + x ).fill(' ');

       if (i >= y && i <= y + height) {
           if (filled === 'filled') {
            row.fill('*', x, x + width);
           } else {
            row.fill('*', x, x + 1);
            row.fill('*', x + width - 1,  x + width );
           }
       }

       if ((i == y || i == y + height) && filled === undefined) {
            row.fill('*', x, x + width);
       }
       
        canvas.push(row);
    }

    return canvas;
}

function getLine( x, y, length, position, color ) {
        let canvas = [];

        switch(position) {
            case 'row':
                for (let i = 0; i <= y; i++) {
                    let row = Array(x + length).fill(' ');

                    if (i == y) {
                        row.fill('-', x,  x + length);     
                    }
                    
                    canvas.push(row);
                }
                break;

            case 'column':
                    for (let i = 0; i <= y + length; i++) {
                        let row = Array(x + 1).fill(' ');
    
                        if (i >= y) {
                            row.fill('|', x,  x + 1);     
                        }
                        canvas.push(row);
                    }
                break;    
        }

    return canvas;
}

function getText(x, y, text, color) {
    let canvas = [];
     text = text.split('');

    for (let i = 0; i <= y; i++) {
        let row = Array(x + text.length).fill(' ');

        if (i == y) {
            row = Array(x).fill(' ', 0 , x)
            row.push(...text);     
        }
        
        canvas.push(row);
    }

    return canvas;
} 


function joinCanvases(figures) {
    var canvas = [];

    for (let i = 0; i < figures.length; i++) {
        let figure = figures[i];
        for (let y = 0; y < figure.length; y++) {
            if (canvas[y] === undefined) {
                canvas[y] = [];     
            }
            
            for (let x = 0; x < figure[y].length; x++) {
                // поправить, чтобы не переписывало пробелами
                canvas[y][x] = figure[y][x]; 
            }
        }
    }

    console.log('CANVAS : ');
    console.log(canvas);
}