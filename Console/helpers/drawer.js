const params = require('../config/drawer');

const Drawer = {
    validateInstruction: ( instruction ) => {
        return instruction.every((inst) => {
            let args = inst.split(' ');
            let color, fill;
            const shape = args[0];
            const x = checkNumber(args[1]);
            const y = checkNumber(args[2]);

            if (x > params.maxWidht && y > params.maxHeight) {
                return false;
            }

            switch (shape) {
                case 'rect': 
                    let height = checkNumber(args[3]);
                    let width = checkNumber(args[4]);
                    color = checkString(args[5]);
                    fill = checkString(args[6]);
                    
                    return !!(x && y && height && width && color
                            && x + width <= params.maxWidht && y + height <= params.maxHeight
                            && params.colors.includes(color)
                            && (!fill || params.fill.includes(fill)));

                case 'line':
                    const weight = checkNumber(args[3]);
                    const position = checkString(args[4]);
                    color = checkString(args[5]);
                    fill = checkString(args[6]);
                    
                    return !!(weight && position && color && fill
                        && (position === 'row' && x + weight <= params.maxWidht
                            || position === 'column' && y + weight <= params.maxHeight)
                        && params.colors.includes(color)
                        && (!fill || params.fill.includes(fill)));   

                case 'text':
                    color = checkString(args[3]); 
                    const text = args.slice(4).join(' ');
                    
                    return !!(text.length > 0 && params.colors.includes(color))
                
                default:
                    return false;    

            };
        });
    },

    getFigures: (instructions) => {
       return new Promise((resolve, reject) => {      // Promise { <pending> }
            resolve((()=> {
                let figures = instructions.map((item) => {
                    let [figure, ...params] = item.split(' '); 

                    return Drawer.handlers[figure](params);
                });

                let canvas = joinCanvases(figures);   
                
                return canvas;
            })());
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

const checkNumber = (data) => isFinite(data) ? Number(data) : false;

const checkString = (data) => (data !== undefined && data !== '') ? data : false;

module.exports = Drawer;