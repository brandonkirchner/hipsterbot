var Slack = require('slack-client');
var pg = require('pg');
var async = require('async');
var config = './config';

var token = process.env.SLACK_TOKEN,
    autoReconnect = true,
    autoMark = true;

var slack = new Slack(token, autoReconnect, autoMark);
var giphy = require('giphy-wrapper')(process.env.GIPHY_TOKEN);

slack.on('open', function() {

	var channels = [],
	    groups = [],
	    unreads = slack.getUnreadCount(),
	    key;

	for (key in slack.channels) {
		if (slack.channels[key].is_member) {
			channels.push('#' + slack.channels[key].name);
		}
	}

	for (key in slack.groups) {
		if (slack.groups[key].is_open && !slack.groups[key].is_archived) {
			groups.push(slack.groups[key].name);
		}
	}

	console.log('Welcome to Slack. You are @%s of %s', slack.self.name, slack.team.name);
	console.log('You are in: %s', channels.join(', '));
	console.log('As well as: %s', groups.join(', '));
	console.log('You have %s unread ' + (unreads === 1 ? 'message' : 'messages'), unreads);
});

method1 = function(channel) {
	channel.send("Yo, method 1");
};

method2 = function(channel, callback) {
	channel.send("Holler, method 2");
	callback(channel);
};

handleError = function(channel, done, client, err) {
	// no error occurred, continue with the request
	if(!err) return false;

	done(client);
	console.log("something bad happened....");
	console.log(err);
	response = "something bad happened. hipsterpoints are in the void."
	channel.send(response);
	return true;
};

addPoints = function(client, user, recipient, points, done, channel, callback) {
	console.log("giving " + recipient.name + " " + points + " hipsterpoints...");
	var totalPoints;
	client.query('INSERT INTO points (giver, receiver, amount) VALUES ($1, $2, $3)', [user.id, recipient.id, points], function(err, result) {
		if(handleError(channel, err)) return;

		client.query('SELECT SUM(amount) as count FROM points WHERE receiver = $1', [recipient.id], function(err, result) {
			if(handleError(channel, done, client, err)) return;

			done();
			totalPoints = result.rows[0].count;
			console.log('Total points = ' + totalPoints);
			callback(points, recipient, totalPoints, channel);
		});
	});
};

sendResponse = function(points, recipient, totalPoints, channel) {
	response = points + ' hipster points awarded to ' + recipient.name + ', who now has ' + totalPoints + ' total hipster points.';

	channel.send(response);
	console.log('@%s responded with "%s"', slack.self.name, response);
};

getLeaderboard = function(client, done, channel, callback) {
	client.query('SELECT receiver, SUM(amount) AS total FROM points GROUP BY receiver ORDER BY total DESC', function(err, result) {
		if (handleError(channel, done, client, err)) return;

		done();
		var leaderboard = result;
		callback(leaderboard, channel);
	});
};

sendLeaderboard = function(leaderboard, channel) {
	var response = 'HIPSTER LEADERBOARD!';
	for (var row = 0, len = leaderboard.rowCount; row < len; row++) {
		response += "\n" + slack.getUserByID(leaderboard.rows[row].receiver).name + " has " + leaderboard.rows[row].total + " hipster points!";
	};

	channel.send(response);
};

redeemPoints = function(client, user, done, channel, callback) {
	console.log("redeeming points!");
	client.query('SELECT SUM(amount) AS count FROM points WHERE receiver = $1', [user.id], function(err, result) {
		if(handleError(channel, done, client, err)) return;

		done();
		userPoints = result.rows[0].count;
		cost = -1 * Math.floor((Math.random() * userPoints));
		response = "All right, " + user.name + ", for " + cost + " points, here's your prize!";
		channel.send(response);

		callback(client, user, user, cost, done, channel, sendGif);
	})
};

sendGif = function(points, recipient, totalPoints, channel) {
	console.log("sending gif!");
	giphy.search('puppy', 100, 0, function(err, data) {
		if (err) {
			console.log("giphy error...");
			console.log(err);
			return;
		};

		var gifs = data.data;
		var gif = gifs[Math.floor(Math.random()*gifs.length)];
		response = "YAY! " + gif.images.downsized.url;
		channel.send(response);
	});
}

slack.on('message', function(message) {
	var type = message.type,
	    channel = slack.getChannelGroupOrDMByID(message.channel),
	    user = slack.getUserByID(message.user),
	    time = message.ts,
	    text = message.text,
	    response = '',
	    recipientRegex = /(U.+)(?:>)/g;

	if (type === 'message' && message.text) {
		if (new RegExp("testbot(.*)").test(text)) {
			async.series([method2(channel, method1)]);
			channel.send("We are in the test method!");
		} else if (text.toLowerCase().indexOf("hipsterbot") != -1) {

			if (text.toLowerCase().indexOf("leaderboard") != -1) {
				pg.connect(process.env.DATABASE_URL, function(err, client, done) {
					async.series([getLeaderboard(client, done, channel, sendLeaderboard)]);
				});
			} else if (text.toLowerCase().indexOf("redeem") != -1) {
				pg.connect(process.env.DATABASE_URL, function(err, client, done) {
					async.series([redeemPoints(client, user, done, channel, addPoints)]);
				});
			} else {
				var points = parseInt(text.match(/\s\d+/g));
				var recipientGroups = recipientRegex.exec(text);

				if(recipientGroups[1] && points) {
					var recipient = slack.getUserByID(recipientGroups[1]);
					pg.connect(process.env.DATABASE_URL, function(err, client, done) {
				    async.series([addPoints(client, user, recipient, points, done, channel, sendResponse)]);	
				  });	
				};
			};
		};
	};
});

slack.on('error', function(error) {
	console.error('Error: %s', error);
});

slack.login();

