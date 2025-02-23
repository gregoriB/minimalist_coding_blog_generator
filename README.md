[![Netlify Status](https://api.netlify.com/api/v1/badges/8006df7f-06b3-4949-8d3e-1f2e6b02b1dd/deploy-status)](https://app.netlify.com/sites/gregoridev/deploys)

[Demo site][demo_url]

# Minimalist Coding Blog Generator

Minimalist developer blog site with syntax highlighting and a persistent light/dark theme toggle.  Utilizes a template and a basic script to auto-generate new static HTML files for blog posts.

The goal is to use at little JS as possible in the client to deliver a good reader experience.  JS is mainly used for theme toggling at this time because I consider that a necessary modern feature of a coding blog site.

## Site Dependencies

- Highlightjs - Adds auto-detected syntax highlighting for code
- Highlightjs-copy - Adds a copy button for code blocks

## Use

To generate the entire blog, update `src/template.html` with the article and updated sidebar links, and run this command:
```sh
$ npm run generate all
```
To display a full list of commands, run the help command:
```sh
$ npm run generate help
```

## Deployment

running `generate all` or `generate build` will generate a build directory with everything needed to deploy the website.

## Notes

- The template.html file is the blog page template with a sidebar for article links and a header
- The `src/update.mjs` node script creates a new html file from template.html
  * The new html file is name from the article title
  * The the most recent month and year from the sidebar are prepended to the, eg: `feb_2025_article_title.html`
- The script also copies everything from template.html _besides the article_ into every html file it finds in the articles/ directory
  * This ensures that all other changes are carried over into every article for consistency
- The `build.mjs` script creates a build directory
  * All of the required directories are copied into it
  * All of the blog articles are copied into the root of the build directory, including `template.html` as `index.html` (to act as a website entry point)
  * Non-minified CSS and JS files are minified

## Limitations/Caveats

- As of right now, updating the side bar is a bit tedious, since it's easy to mess up dates
  * In the future, I'd like to have the script automatically generate sidebar links using the existing html files and the current date, instead of having that hardcoded in
- There isn't much freedom, which is by design. Anything can be posted in the article section, but that's it
- Everything is hardcoded into the template.html file
- There is a backup mechanism for articles, but also use version control and check your diffs to be safe.
- The current minification is not great and is used as a hold-over for now

## Planned Features

- Social media links, possibly in the footer or sidebar
- A way to use JSON or some other format to store blog articles and auto-generate new posts and links from that
    * This planned feature is up in the air, because I don't want to make it too easy to create AI slop blogs
- Some way to handle scaling the sidebar with article links
    * It shouldn't grow longer and longer forever. It would need to partially collapse or link to a new page with more articles
- Better minification

## Contributions

I'll accept contributions to fix bugs, but new unplanned features may be rejected on the grounds that the blog site is supposed to be very minimal.  Personally, if I ever need to scale this up to something that is not so minimal, I'll fork it and go from there.

Also please remember to run the prettier script before submitting a pull request.


[//]: #
[demo_url]: https://gregoridev.netlify.app/
