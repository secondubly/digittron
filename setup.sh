#!/bin/bash
echo "Welcome to the bot setup script!"
echo "We will take you through the necessary steps to get your bot up and running."
while :
do
    read -p "Please enter your Twitch Client ID (see https://dev.twitch.tv/console): " client_id
    read -p "You entered \"$client_id\", is this correct? " -n 1 -r
    echo
    # if confirmed, continue
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        echo $client_id > .env
        echo "success"
        break ### terminate loop
        # do dangerous stuff
    fi
    echo ""
done
read -p "Please enter your Twitch Client Secret (see https://dev.twitch.tv/console): " client_secret
echo "You entered $client_secret"