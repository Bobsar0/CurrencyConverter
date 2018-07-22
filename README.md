# CurrencyConverter
Currency converter Progressive Web App built using Javascript ES6 modules as part of the 2018 Google Africa Scholarship Program organised in collaboration with Udacity and Andela(ALC 3.0).

The project is hosted on Github Pages. Click [https://bobsar0.github.io/CurrencyConverter/] to view the demo app.

## Features
- Online/Offline conversion between any 2 major Fiat currencies plus BITCOIN (See note below).
- Online/Offline Chart functionality to observe price fluctuation over a 7-day period.
- Responsive design suitable for all screen sizes.

> For offline conversion, the selected currencies would have to be initially converted online (updated every 3 hrs.)

## Getting the project up and running

The following will help you get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

```
node.js [version: LTS or 9.x] OR Visual Studio Code
live-server
```

### Installing

Clone the project to your computer.
```sh
git clone https://github.com/bobsar0/CurrencyConverter.git
cd CurrencyConverter
```

#### Using node.js
Install the `live-server` npm package.

```sh
npm install -g live-server
```

Run `live-server`.

```sh
live-server
```
This will start a local server on your machine.

#### Using Visual Studio Code (VSCode)
Install the live-server extension on VSCode

Right click index.html and select `Open with Live Server`.

This will also start a local server on your machine.