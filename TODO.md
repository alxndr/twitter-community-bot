tasks one might want to run:

    $ supervisor -n error -x npm start       # autorun
    $ jasmine-node spec --autotest --watch . # autotest
    $ istanbul cover jasmine-node -- spec    # coverage

no quote marks in .env
...also no comments, node will still interpret them

revisit bot/server communication

test webserver?
