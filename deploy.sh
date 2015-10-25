#!/bin/bash

set -e
set -x

# lol hax

npm install
node_modules/.bin/jspm unbundle
node_modules/.bin/jspm bundle main site/bundle.js --inject --minify
TMPDIR=`mktemp -d`
mv node_modules $TMPDIR
mv site/ $TMPDIR
git checkout gh-pages
rm -rf $PWD/*
mv $TMPDIR/site/* .
git add .
git commit -a -m"Update site"
git push deploy gh-pages:master
git checkout master
mv $TMPDIR/node_modules .
