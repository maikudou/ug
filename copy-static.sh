#!/usr/bin/env bash
if ! [[ -e ./dist ]];then
  mkdir dist
fi

echo "Copy static $1"
if [ $1 = "firefox" ];then
  rm -rf ./dist/firefox
  mkdir dist/firefox

  cp ./src/common/popup.html ./dist/firefox/popup.html
  node ./src/common/manifest.js > ./dist/firefox/manifest.json
elif [ $1 = "chrome" ];then
  rm -rf ./dist/chrome
  mkdir dist/chrome

  cp ./src/common/popup.html ./dist/chrome/popup.html
  node ./src/common/manifest.js chrome > ./dist/chrome/manifest.json
else
  echo "Target $1 not found"
fi
