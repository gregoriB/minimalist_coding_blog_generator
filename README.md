[![Netlify Status](https://api.netlify.com/api/v1/badges/8006df7f-06b3-4949-8d3e-1f2e6b02b1dd/deploy-status)](https://app.netlify.com/sites/minimalist-blog-site/deploys)

[Demo site][demo_url]

# Minimalist Coding Blog Generator

Minimalist developer blog site with syntax highlighting and a persistent light/dark theme toggle.  Utilizes a template and a basic script to auto-generate new static HTML files for blog posts.

The goal is to keep the site minimal and focused on delivering a good reader experience.  JavaScript is also used minimally only when a comparable HTML or CSS solution doesn't exist.

## Site Dependencies

- Highlightjs - Adds auto-detected syntax highlighting to code
- Highlightjs-copy - Adds a copy button to the code blocks

## Use

Generate a new blog configuration file to articles/ directory:
```sh
$ npm run generate new
```
or alternatively to generate the file with a specific name:
```sh
$ npm run generate new "My First Blog Post"
```

Build site and articles:
```sh
$ npm run generate build
```

Building can also include a the name of a file to be the featured article:
```sh
$ npm run generate build "My First Blog Post"
```
<br>

- Articles are in `.yaml` format.  Be sure to use yaml syntax verification!  Running `npm run format` should catch yaml errors, but it will not correct them.
- All of the content of `src/site/` will be included in the site build
- All non-article configs go in the `src/configs/` directory
  * Markers in the HTML which match any config entries will be replaced with that data. <br>
  eg: if `{{SITE_TITLE}}` exists in an HTML file and matches a config key `SITE_TITLE`, that data is inserted in its place
  * These HTML files can also utilize templates if the template is registered in `src/generator/variables.mjs`, so things like the site header and footer can be reused everywhere.
- The `new` command script creates a new article yaml file from `src/template/article.yaml`
  * If a name is not specified, a unique name using the current date will be used
  * If a name is specified, then the article heading property in the generated article config will be auto-filled with it.
- The `build` command creates a build/ directory and builds the articles
  * Backups are first created for all articles
  * The required directories are copied into the build/ directory
  * All of the blog articles are built in the build/ directory, including an `index.html` file for the featured article (to act as a website entry point)
  * ALL CSS and JS files are minified

## Notes

- A hand-picked version of HightlightJS is used for code syntax highlighting. It only includes the most common languages to reduce the bundle size.
  * If you need more language support, then a custom version of the library can be download from [their website][highlightjs_url] and placed into the the `src/site/deps/highlight/` directory

## Deployment

Running `$ npm run generate build` generates a build directory with everything needed to deploy the website.

## Planned Features

- Some way to handle scaling the sidebar with article links
    * It shouldn't grow longer and longer forever

## Contributions

I'll accept contributions to fix bugs, but new unplanned features may be rejected on the grounds that the blog site is supposed to be very minimal. If I ever need to scale this up to something that is not so minimal, I'll fork it and go from there.

Also please remember to run the prettier script before submitting a pull request.


[//]: #
[demo_url]: https://minimalist-blog-site.netlify.app/
[highlightjs_url]: https://highlightjs.org/download/
