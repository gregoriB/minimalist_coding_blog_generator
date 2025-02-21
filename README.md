# Minimalist Code Blog Generator

Minimalist developer blog site with syntax highlighting and a persistent light/dark theme toggle

## Dependences

- Highlightjs - Adds auto-detected syntax highlighting for code
- Highlightjs-copy - Adds a copy button for code blocks

## Use

- The index.html file is a blog template with a sidebar for article links
- The `generate.mjs` node script creates a new html file from index.html
  - The new html file is name from the article title
  - The the most recent month and year from the sidebar are prepended to the, eg: feb_2025_article_title.html
- The script also copies everything from index.html _besides the article_ into every html file it finds in the articles/ directory
  - This ensures that all other changes are carried over into every article for consistency

## Limitations/Caveats

- As of right now, updating the side bar is a bit tedious, since it's easy to mess up dates
  - In the future, I'd like to have the script automatically generate sidebar links using the existing html files and the current date, instead of having that hardcoded in
- There isn't much freedom, which is by design. Anything can be posted in the article section, but that's it
- Everything is hardcoded into the index.html file
- There is not yet any kind of backup mechanism for articles, so use version control and check your diffs!
