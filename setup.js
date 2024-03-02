// #!/bin/bash
// echo "Welcome to the bot setup script!"
// echo "We will take you through the necessary steps to get your bot up and running."
// while :
// do
//     read -p "Please enter your Twitch Client ID (see https://dev.twitch.tv/console): " client_id
//     read -p "You entered \"$client_id\", is this correct? " -n 1 -r
//     echo
//     # if confirmed, continue
//     if [[ $REPLY =~ ^[Yy]$ ]]
//     then
//         echo $client_id > .env
//         echo "success"
//         break ### terminate loop
//         # do dangerous stuff
//     fi
//     echo ""
// done
// read -p "Please enter your Twitch Client Secret (see https://dev.twitch.tv/console): " client_secret
import prompts from 'prompts'
const { prompt } = prompts
import fs from 'fs'


let questions = [
    {
        type: 'text',
        name: 'client_id',
        message: 'Enter your Twitch Client ID (see https://dev.twitch.tv/console): ',
        validate: (client_id) => {
            if(client_id.length === 30 || client_id.length === 31) {
                return true
            }
            return 'Invalid length for Client ID'
        }
    },
    {
        type: 'password',
        name: 'client_secret',
        message: 'Enter your Twitch Client Secret (see https://dev.twitch.tv/console): ',
        validate: (client_secret) => {
            if(client_secret.length === 30 || client_secret.length === 31) {
                return true
            }
            return 'Invalid length for Client Secret'
        }  
    },
    {
        type: 'list',
        name: 'channels',
        message: 'Enter the usernames of the twitch channel the bot should join separated by commas',
        initial: '',
        separator: ','
    },
    {
        type: 'text',
        name: 'username',
        message: 'What is the bot account\'s username?'
    },
    {
        type: 'text',
        name: 'pg_user',
        message: 'What is your database username? (optional, default: postgres)',
        initial: 'postgres'
    },
    {
        type: 'text',
        name: 'db_name',
        message: 'What is your database name? (optional, default: digittron)',
        initial: 'digittron'
    },
    {
        type: 'password',
        name: 'pg_pass',
        message: 'What is your database password? (optional, default: postgres)',
        initial: 'postgres'
    },
    {
        type: 'confirm',
        message: 'Should I use a special port to connect to the database?',
        initial: false
    },
    {
        type: prev => prev === true ? 'number' : null,
        name: 'pg_port',
        message: 'What port should I use?',
        default: 5432
    }
];

async function readWriteAsync(id) {
    fs.readFile('./src/.env', 'utf-8', (err, data) => {
        if (err) throw err;

        console.log('orig', data)
        const updated = data.replace(/^CLIENT_ID=\'\'/gm, `CLIENT_ID='${id}'`)

        console.log('update', updated)
        fs.writeFile('./src/.env', updated, 'utf-8', (err) => {
            if (err) throw err;
            console.log('Edit complete')
        })
    })
}

await (async() => {
    const response = await prompt(questions)
    console.log(response)
    // fs.copyFile('./src/.env.example', './src/.env', (err) => {
    //     if (err) {
    //         throw err
    //     }
    // })

    // const writeData = {
    //     clientID,
    //     clientSecret
    // }
    // await readWriteAsync(clientID)
})()