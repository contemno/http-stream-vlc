var http = require('http');
var os = require('os');
const BIND_IP="0.0.0.0"; 
const BIND_PORT=8080;

// HTTP server handler function
function videoserver(request, response){
    var validator = require('validator');
    var video_query = require('url').parse(request.url,true).query;
    var requestisurl = validator.isURL(video_query.URL, {
      protocols: [
        'http',
        'rtsp',
        'udp',
        'rtp'
      ],
      require_protocol:true,
      require_valid_protocol: true,
      allow_underscores: false
    });

    // 
    if (requestisurl) {
    // Process the incoming video request.

      // Set VLC transcode options if the query "format" includes "ogg" as the requested format.
      if (video_query.format == 'ogg') {
        var vlc_transcode = '--sout=#transcode{vcodec=theo,vb=200,width=320,height=240,acodec=none}:standard{access=file,mux=ogg,dst=-}';
        response.setHeader('Content-Type', 'video/ogg');
        var video_format = 'Ogg Theora'
      } else {
        var vlc_transcode = '--sout=#std{access=file,mux=ts,dst=-}';
        response.setHeader('Content-Type', 'video/mp4');
        var video_format = 'Passthrough'
      }


      var byline = require('byline');
      var spawn = require('child_process').spawn;
      var vlc_cmd = "cvlc";
      var vlc_args = [
          '--no-repeat',
          '--no-sout-audio',
          '--no-loop',
          video_query.URL,
          '--transform-type=180',
          vlc_transcode,
          '--sout-keep'
      ];
      
      var child = spawn(vlc_cmd, vlc_args);
      console.log("Child PID: %d | Requested Video: %s Format: %s", child.pid, video_query.URL, video_format);

      // connect the child process STDERR to the Parent STDOUT for debugging VLC issues. Could be used for logging.
      /*
      var vlcstderr = byline(child.stderr);
      vlcstderr.on('data', function(line) {
        console.log("Child PID: %d | STDERR | %s", child.pid, line);
      });
      */

      response.sendDate = false;
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'close');
      // Send the response header to the client before streaming video data.
      response.writeHead(200);
      // Stream child STDOUT data (VLC video) to client over HTTP
      child.stdout.on('data', function (data) {
          response.write(data, "binary");
      });
      // Close the connection if the child exits or closes for any reason.
      child.on('exit', function (code, signal) {
          response.end();
      });
      child.on('close', function (code, signal) {
          response.end();
      });
      // Kill child process if the connection is closed or lost.
      request.on('close', function () {
          console.log("child PID: %d | Connection closed; killing process.", child.pid);
          child.kill('SIGTERM');
      });
    } else {
    // More than likely a load balancer health check.

      response.setHeader('Content-Length', '0');
      response.setHeader('Connection', 'close');
      response.sendDate = false;

      // Optionally delay the response to skew load balancer weighting. Ensure load balancer timeout is greater than artificial delay.
      var cpu_count = os.cpus().length; // Determine the number of CPUs
      var loadavg = os.loadavg()[0]; // Store the 1 minute load average

      if ( loadavg > cpu_count ) {
        setTimeout(response.end(), 1000);
      } else {
        response.end();
      };

    }
}

var server = http.createServer(videoserver);
server.listen(BIND_PORT, BIND_IP,
    function(){
          //Successfully started listening for client connections.
          console.log("Listening: http://%s:%s/", BIND_IP, BIND_PORT);
    }
);