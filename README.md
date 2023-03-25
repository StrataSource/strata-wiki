# Strata Wiki

Hi! This is our wiki software. It uses Markdown files in order to compile static HTML files which can be deployed to the web.

## Installation

To install the wiki, clone it and simply run `npm i`.

## Running

In order to run the development server, run `npm run dev`. Wrangler has to be installed for this to work.

⚠ The dev server doesn't update in realtime anymore for the sake of performance. Please recompile if you changed something.

## Building

To build the wiki to html files, run `npm run build`. You'll find the result in `public`.
