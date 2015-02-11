hipsterbot
============
a node based slack bot.
-----------------------

How to Deploy
=============
Hipsterbot runs in Heroku. You can either point Heroku directly at this repository to get the latest updates,
or fork it.

Then, before it will run, you'll need to set the SLACK_TOKEN and GIPHY_TOKEN configuration variable. You can do this
through the Heroku dashboard, or through the command line --

```
heroku config set SLACK_TOKEN='[token goes here]'
heroku config set GIPHY_TOKEN='[token goes here]'
```

How Does It Work?
=================
