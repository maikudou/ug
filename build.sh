#!/usr/bin/env bash
rm -rf ./build
rm -rf ./dist
mkdir dist

yarn compile
cp -R ./build/firefox ./dist
cp ./src/common/popup.html ./dist/firefox/popup.html
cp ./src/common/manifest.json ./dist/firefox/manifest.json