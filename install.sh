#!/usr/bin/sh

npm install -g yarn
yarn set version berry
yarn install --immutable --immutable-cache
yarn run dist

