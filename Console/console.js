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
    let painting = text.reduce((prev, item) => {
        let figure = item.split();
    }, []);
    
    console.log('\x1b[46m', 'I am cyan');  //cyan

});