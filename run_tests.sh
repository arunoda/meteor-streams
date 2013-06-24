#!/bin/bash
PACKAGE_NAME=streams
PACKAGE_PATH=laika/packages/$PACKAGE_NAME

#move and setup packages
rm -rf $PACKAGE_PATH
mkdir -p $PACKAGE_PATH

cp -rf ./lib $PACKAGE_PATH
cp -rf ./package.js $PACKAGE_PATH

cd laika
laika $1
