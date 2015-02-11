#hipsterbot

##a node.js based slack bot.


#How to Deploy

Hipsterbot runs in Heroku. You can either point Heroku directly at this repository to get the latest updates,
or fork it.

Then, before it will run, you'll need to set the SLACK_TOKEN and GIPHY_TOKEN configuration variable. You can do this
through the Heroku dashboard, or through the command line --

```
heroku config set SLACK_TOKEN='[token goes here]'
heroku config set GIPHY_TOKEN='[token goes here]'
```

#How Does It Work?
Hipsterpoints are the currency of the future. We envision a world where anything and everything can be paid for
with arbitrary, worthless online points. Owe someone lunch? Send them some hipsterpoints!
```
hipsterbot, give @joe.blow 100 hipsterpoints
```
How many is too many? The sky is the limit!

##How do I know how many I have?
If you want to see how many points you have, just ask!
```
hipsterbot, lets see a leaderboard!
```

##What can I do with them?
All hipsterpoints are backed by actual puppy gifs. By asking hipsterbot to redeem your hipsterpoints, you are turning in an arbitrary amount of hipsterpoints for a puppy gif of equally arbitrary quality.
```
hipsterbot, I want to redeem some points!
```

#How do I get hipsterbot in a certain channel?
First, invite hipsterbot to the channel through slack. Then, set the `CHANNEL` environment variable to whatever channels you want hipsterbot in --

```
heroku config:set CHANNELS="#random, #fedoras, #indiemusic"
```

Then, you may need to restart your worker, either through the Heroku UI, or command line --
```
heroku ps:restart worker
```

#Why?
TODO: find out why.
