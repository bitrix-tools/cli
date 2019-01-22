#!/usr/bin/env bash

path=$(pwd)
line=${path//\//\\/}
echo $(sed "/$line/d" ~/.bitrix.lock) > ~/.bitrix.lock
