#!/bin/bash
PACKAGE_NAME=stream
PACKAGE_PATH=laika/packages/$PACKAGE_NAME

#move and setup packages
rm -rf $PACKAGE_PATH
mkdir -p $PACKAGE_PATH

FILES=./*
for file in $FILES
do
  if [[ $file != './laika' ]]; then
    cp -rf $file $PACKAGE_PATH
  fi
done

cd laika
laika $1
