for the comments I want to leave in package.json

    $ supervisor src/app.js                  # autorun
    $ jasmine-node spec --autotest --watch . # autotest

can `jasmine-node` or `db-migrate` be moved into `devDependencies`?

be nice to use pg.js instead of pg but db-migrate hardcodes pg
...and i needed to `npm install -g pg` to get it to work?

