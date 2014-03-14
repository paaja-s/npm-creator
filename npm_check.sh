#! /bin/sh

# Skript overovani behu node serveru npm creatoru kazdych 10 minut cronem

# Pri nenalezeni procesu node serveru je nastartovan
if [ ! -e /home/sg8/npm/npm_creator.lock ]
	then
		[ ! "$(pgrep -f npm-creator)" ] && /home/sg8/npm/bin/npm-creator -v > /home/sg8/npm/npm_creator.log
fi