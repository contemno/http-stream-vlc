# http-stream-vlc

This a little app I mainly wrote it to convert a multicast stream to a HTTP stream. It works by simply passing the video's URL as a query.
http://10.0.0.1/video.mpg?URL=udp://@225.12.2.41/

Optionally, one can also specify ogg/theora as the format. I included this for compatibility with the <video> tags in Chrome. 
http://10.0.0.1/video.mpg?URL=udp://@225.12.2.41/&format=ogg
