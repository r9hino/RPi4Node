const http = require('./app.js');

const port = 3000;

http.listen(port, () => {
    console.log('Server is running on port: ', port);
});