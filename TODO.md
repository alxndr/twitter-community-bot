for the comments I want to leave in package.json

    $ supervisor -n error -x npm start       # autorun but broken atm
    $ jasmine-node spec --autotest --watch . # autotest

be nice to use pg.js instead of pg but db-migrate hardcodes pg
...and i needed to `npm install -g pg` to get it to work?

migrate needs to use ./node_modules/.bin/db-migrate.
(installing it globally (so you can `$ db-migrate up`) will try to look for a global pg package)
