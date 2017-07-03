# emn
command line string replacement

# Usage

`### cli`

````shell
$ emn <glob> <pattern> <replacement> [--preview] [--silent]
  # glob globby pattern to define files to search
  # pattern: regex pattern used to find matches (can include flags)
  # replacement: string to replace the matches with
  # --preview: log replacements to the console without applying them
  # --silent: prevemt any logging to the console
````

````shell
$ emn "src/**/*.js" "/var (\w+)/gi" "let \1" --preview
````

`### require`

````javascript
const enm = require('enm');

enm(glob, pattern, replacement[, options]);
  // glob: globby pattern to define files to search in
  // pattern: regex pattern used to find matches
  // replacement: string to replace matches with
  // options:
  //    isPreview: log the replacements to the console without applying them
  //    isSilent: prevents any logging to the console
````

````javascript
emn('src/**/*.js', /var (\w+)/gi, 'let $1', {isPreview: true});
````