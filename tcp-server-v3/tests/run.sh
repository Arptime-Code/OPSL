#!/bin/bash
fuser -k 3000/tcp 3001/tcp 3002/tcp 2>/dev/null; sleep 1
cd /home/arptime/Main_Programming/TCP-Server-For-JS-Libs/tcp-server-v3
node server.js &
sleep 2
cd /home/arptime/Main_Programming/TCP-Server-For-JS-Libs/tcp-server-v3/tests
node demo1.js &
node demo2.js &
wait