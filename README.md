# http-stream-vlc

I mainly wrote this app to convert a multicast stream to a HTTP stream. It works by simply passing the video's URL as a query.
http://10.0.0.1/video.mpg?URL=udp://225.12.2.41/

Optionally, one can also specify ogg/theora as the format. I included this for compatibility with the video tag in Chrome. 
http://10.0.0.1/video.mpg?URL=udp://225.12.2.41/&format=ogg

All it does is pass the URL query value directly to a VLC child process, so it supports any source video VLC supports.
