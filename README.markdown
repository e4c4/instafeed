I created this fork (https://github.com/asalant/Realtime-Demo) of
https://github.com/Instagram/Realtime-Demo because that implementation is
incompatible with recent versions of a few dependencies.

This README is focused on getting you up and running locally with this
app.

See
http://blog.carbonfive.com/2011/06/14/instagram-realtime-demo-with-node-js-redis-and-web-sockets/
for discussion and comments.

# Installation

## Get the Source

Check it out my fork of the project from https://github.com/asalant/Realtime-Demo.

## Install Node and Redis

Depending on your platform, you have a number of options for installing Node.js
and Redis. I used Homebrew on my Mac to install the latest versions. The
instructions in the original project README are fine, but you should use
the current release version for each.

## Install Application Dependencies

Install NPM (the Node Package Manager) and the node dependencies as described
in the original README.

    curl http://npmjs.org/install.sh | sh
     
    sudo npm install redis
    sudo npm install socket.io
    sudo npm install express
    sudo npm install jade

## Install localtunnel

In order to run the application locally, you need a way for the Instagram API
to publish updates to the app. It does this through webhook callbacks so your
app needs to be available on the public internet. 

localtunnel is a good solution for this. Follow the installation instructions
on https://github.com/progrium/localtunnel#readme. If you’re a Ruby developer 
using RVM and Bundler, my fork of the realtime app includes an .rvmrc and 
Gemfile that pull in the localtunnel dependency. Just run ‘bundle’ to install 
it and continue with the configuration instructions from the localtunnel README.

# Configuration

First register a new API client at http://instagram.com/developer/manage/ to
get a client id and secret. For this app, the values for website and callback
URL are not important. I just used http://localhost:3000.

Instead of editing settings.js to configure the client id and secret as
suggested in the original project README, set environment variables which
settings.js is already written to pick up. This is also useful for some of the
utility commands you can execute against the API using curl as I describe
below. You can either set them in each terminal session or globally in your
shell environment (.profile, .bashrc, .zshrc).

    export IG_CLIENT_ID=YOUR_CLIENT_ID
    export IG_CLIENT_SECRET=YOUR_CLIENT_SECRET

I added a bunch of logging statements at key points in the code when doing my
original troubleshooting. If you want to hide these additional messages, in
settings.js, set:

    exports.debug = false;

# Party Time

Open a terminal and start Redis. There’s nothing special in this config except
that it runs Redis on a non-default port.

    redis-server conf/redis.conf

Open another terminal and start the app in Node:

    node server.js

Open another terminal and create a localtunnel connection to forward a
internet-accessible host to your local machine.

    localtunnel 3000

A simple test to make sure the localtunnel connection is working is to hit a
non-existant URL on your node app in your web browser. You’ll get a 404 from
the app.

    open http://xxx.localtunnel.com/foo

You should see “Cannot GET /foo” in your browser.

I find that localtunnel connections will sometimes die and I have to kill it
locally and start it again. If you hit /foo again and it hangs, the connection
is gone. When you kill and recreate the connection, the URL changes for the
callback webhook parameter so it’s handy to set this host as another
environment variable.

Open another terminal and set the tunnel host in your environment:

    export IG_CALLBACK_HOST=http://xxx.localtunnel.com

Then add a subscription for San Francisco with a 5k radius.

    curl -F "client_id=$IG_CLIENT_ID" \
             -F "client_secret=$IG_CLIENT_SECRET" \
             -F 'object=geography' \
             -F 'aspect=media' \
             -F 'lat=37.761216 ' \
             -F 'lng=-122.43953' \
             -F 'radius=5000' \
             -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/san-francisco/" \
             https://api.instagram.com/v1/subscriptions

If you have debug=true in settings.js, you should see the challenge callback in
your Node console.

Get a list of the subscriptions you’ve added:

    curl "https://api.instagram.com/v1/subscriptions?client_id=$IG_CLIENT_ID&client_secret=$IG_CLIENT_SECRET"

To see a list of recent media for the geography you subscribed to, put the
object_id from the subscription in this URL. Note that you won’t see all these
in your local app unless they’ve been added since you started receiving
updates.

    curl "https://api.instagram.com/v1/geographies/[object_id]/media/recent?client_id=$IG_CLIENT_ID"

To clear all your subscriptions:

    curl -X DELETE \
     "https://api.instagram.com/v1/subscriptions?object=all&client_id=$IG_CLIENT_ID&client_secret=$IG_CLIENT_SECRET"

Localtunnel connections appear to die after a while. When they do, close the
connection in your terminal, create a new one, delete your subscriptions, and
add new ones with the new localtunnel URL.

# Check It Out

Open the app in your browser to see the updates received since you started the
app. You can use either the localtunnel URL or just http://localhost:3000/.

If the page loads without any images, you may not have received any updates
yet. I did find that even for San Francisco the updates trickle in slowly. I
like running the app with debugging on so I can tell when updates come in. The
images are stored in Redis across app restarts so you can make code changes,
restart, reload and see the updates you have received so far. Redis doesn’t
persist across its own restarts, so if you restart Redis, you’ll start
collecting updates anew.

# What Next?

Well that was fun. Hopefully you got it up and running a lot more easily than I
originally did.

So what do you want to do next? You could deploy it to the cloud at Joyent. You
could hack the UI to display updates differently. You could accept user input
to create new subscriptions for tags or locations. Or you could just hack
around in the code to see how this stuff really works.

I hope this helps you out and if you come up with improvements or cool hacks of
your own, definitely let me know.


