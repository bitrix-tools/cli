#!/usr/bin/env bash

echo $(pwd) >> ~/.bitrix.lock
sort -u ~/.bitrix.lock -o ~/.bitrix.lock