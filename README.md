# Toronto Transit Time

A [Pebble](https://www.pebble.com/) application that shows transit predictions on nearby stops in Toronto.

![aplite](screenshots/aplite_title.png) &nbsp; ![routes](screenshots/aplite1.png) &nbsp; ![predictions](screenshots/aplite2.png)

### Downloading

Just search for "Toronto Transit App" on the [Pebble App](https://www.pebble.com/apps) for your phone. There is no need to install any companion app.

### Structure

The `/app` directory contains:

- the C code of the main application (with separate files for the routes and predictions windows and layers, plus a splash screen layer that is shared among them).
- the JavaScript code that provides location and API request/parsing on behalf of the C app.

The `/server` directory contains a Rails app that pre-fetches the stops from the TTC system and exposes an endpoint that receives a pair of coordinates and returns the closest stops and the routes served by each of those stops.

### Thanks

- To [@bani](https://github.com/bani) for help with images and Pebble development resources.
- To [@cabello](https://github.com/cabello) for the JavaScript tips and contributions.
- To the TTC, for offering a service I am pleased to use, and for making the data APIs that made this application possible.

### License

Copyright (c) 2016 Carlos Duarte Do Nascimento

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### Legal

The stop locations and predictions come from the [TTC Real-Time Next Arrival](http://www1.toronto.ca/wps/portal/contentonly?vgnextoid=4427790e6f21d210VgnVCM1000003dd60f89RCRD) service. The app or its authors do not have or claim to have any affiliation with the [Toronto Transit Commission (TTC)](https://www.ttc.ca/).

