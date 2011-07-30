var resolve = require('../persistence/file-resolve');


console.log(resolve.getPageTitle(""));
console.log(resolve.getPageTitle("/Hello World"));
console.log(resolve.getPageTitle("/Hello_World.html"));
console.log(resolve.getPageTitle("Hello World"));
console.log(resolve.getPageTitle("/path/hello world"));
console.log(resolve.getPageTitle("/path/hello world"));

console.log("filename");
console.log(resolve.filename(""));
console.log(resolve.filename("/Hello World"));
console.log(resolve.filename("/Hello_World.html", true));
console.log(resolve.filename("/Hello_World.html", false));
console.log(resolve.filename("Hello World"));
console.log(resolve.filename("/path/hello world"));
console.log(resolve.filename("/path/hello world"));

console.log("dirname");
console.log(resolve.dirname(""));
console.log(resolve.dirname("/Hello World"));
console.log(resolve.dirname("/a/Hello_World.html"));
console.log(resolve.dirname("/a/b/Hello World"));
console.log(resolve.dirname("a/hello world"));
console.log(resolve.dirname("a/b/hello world"));

