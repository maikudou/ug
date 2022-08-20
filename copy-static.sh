#!/usr/bin/env bash
rm -rf ./dist
mkdir dist

if [[ $1="firefox" ]];then
  mkdir dist/firefox

  cp ./src/common/popup.html ./dist/firefox/popup.html
  cp ./src/common/manifest.json ./dist/firefox/manifest.json
elif [[ $1="chrome" ]];then
  mkdir dist/chrome

  cp ./src/common/popup.html ./dist/chrome/popup.html
  cp ./src/common/manifest.json ./dist/chrome/manifest.json
else
  echo "Target $1 not found"
fi
