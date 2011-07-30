var path = require('path');

console.log( path.normalize('../../path') );

console.log( path.normalize('../path') );

console.log( path.normalize('path/..') );

console.log( path.normalize('path/sub/..') );
