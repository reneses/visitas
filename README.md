# visitas.js
Basic Node.js dashboard for logs analysis

## Demo images
![Visitas demo 1](https://raw.githubusercontent.com/reneses/visitas.js/master/demo/demo-1.png)
![Visitas demo 2](https://raw.githubusercontent.com/reneses/visitas.js/master/demo/demo-2.png)
![Visitas demo 3](https://raw.githubusercontent.com/reneses/visitas.js/master/demo/demo-3.png)

## Requirements
- `Node`
- `npm`
- A `Mongo` connection

## Installation

Simply install `visitas` via npm:

```
npm install --save visitas
```

And then edit the file `app.js`, registering `visitas` before any route:

```
var visitas = require('visitas');
app.use(visitas( {MONGO CONNECTION}, {OPTIONS} ));
```

## Configuration

Mongo connection properties:
- `host` (required)
- `port` (required)
- `db` (required)
- `user`
- `password`

Options:
- `log` (boolean/object):  `visitas` can also store the logs for the application. This property accepts `false` if no logging behaviour is required, or an object of options:
  - `filename` (string): Filename prefix for the logs [default `access`]
  - `rotation` (boolean): Use daily rotation [default `false`]
  - `directory` (string): Directory for the logs [default `node_moduls\visitas\log`]
- `dashboard` (boolean/string): Dashboard endpoint [default `/visitas/`]

## Simple test

First, init the template project and install `visitas`

```
express visitas-test
cd visitas-test && npm install
npm install --save visitas
```

... and edit the file `app.js` registering `visitas`, before any route is registered:

```
var visitas = require('visitas');
app.use(visitas({
  host: 'localhost',
  port: 27017,
  db: 'visitas'
}));
```

Generate some logs:

```
node node_modules/visitas/generate-logs.js 
```

The script also admits parameters: 

```
node path/to/generate-logs.js [number of logs, default 1000] [directory, default visitas/log]
```

Finally, start the application...

```
npm start
```

And browse to `http://127.0.0.1:3000/visitas`
