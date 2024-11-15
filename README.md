# Strata Wiki

[![Strata Source](https://branding.stratasource.org/i/strata/logo/ondark/color.svg)](https://stratasource.org)

Welcome to the Strata Wiki!

This is the custom wiki software that powers the Wiki for most of our games. If you're looking to edit contents on the wiki, you may wish to check out [the main Wiki repository](https://github.com/StrataSource/wiki/).

## Quick Start

To quickly start developing on the wiki, run the following:

```bash
npm run dev
```

This will boot up the dev server that allows you to develop with instant refresh.

> [!NOTE]  
> The first time you launch the dev server, it'll execute a build of the full site and index it for the search. This may take a few minutes.
>
> The search data is cached and will update on every build.

## Building

To run a build, simply run the following:

```bash
npm run build
```

This will place the output files in `site/build`, which can then be served using the HTTP Server of choice.