const fs = require('fs');

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

const Drawer = {
    checkInstructions: (instructions) => {

    },

    getFigures: (instructions) => {
        console.log('instructions:  ', instructions);
       return new Promise((resolve, reject) => {      // Promise { <pending> }
            resolve(()=> {
               

                let figures = instructions.map((item) => {
                    let [figure, ...params] = item.split(' '); 

                    return Drawer.handlers[figure](params);
                });

                console.log('figures: ', figures);    

                let canvas = joinCanvases(figures);     

                console.log('canvas: ', canvas);
            
                return canvas;
            });
       });
    },

    handlers: {
        rect: ([x, y, width, height, colorRect, filled]) => {
            x = Number(x);
            y = Number(y);
            width = Number(width);
            height = Number(height);
            return getRect({ x, y, width, height, colorRect, filled });
        },
    
        line: ([x, y, length, position, colorLine]) => {
            x = Number(x);
            y = Number(y);
            length = Number(length);
            return getLine({ x, y, length, position, colorLine });
        },
    
        text: ([x, y, colorText, ...text]) => {
            x = Number(x);
            y = Number(y);
            text = text.join(' ');
            return getText({ x, y, text, colorText });
        }
    }
};   


const getRect = ({ x, y, width, height, color, filled }) => {
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

const getLine = ({ x, y, length, position, color }) => {
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

const getText = ({x, y, text, color}) => {
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


const joinCanvases = (figures) => {
    var canvas = [];

    for (let i = 0; i < figures.length; i++) {
        let figure = figures[i];
        for (let y = 0; y < figure.length; y++) {
            if (canvas[y] === undefined) {
                canvas[y] = [];     
            }
            
            for (let x = 0; x < figure[y].length; x++) {
               if (canvas[y][x] !== undefined && canvas[y][x] !== ' ' && figure[y][x] === ' ') {
                    continue;
               }

                canvas[y][x] = figure[y][x]; 
            }
        }
    }

    return canvas;
}

module.exports = Drawer;