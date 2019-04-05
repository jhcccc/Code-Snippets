# SMS-Azure
Control Azure virtual machine with SMS text message

## Intro
Sometimes, you don’t have a computer with you, and you probably don’t have an iPad either. You may not even have internet connection. (for example, you are on an over-crowded hackathon wifi 😔 ) All you got is your phone, which may not even be a smartphone…but you need to manage your azure virtual machine! What do you do?  
The answer: use SMS-Azure to control your azure virtual machine with SMS!

(coded on [mchacks6](https://mchacks.ca))

## Dependency
node js 8.0 or newer

`npm install twilio`


## Usage

run on server with nodejs and twilio
`node SMS-Azure.js`

Currently Available commands:
* `start [vmname]`
* `restart [vmname]`
* `stop [vmname]`
* `dellocate [vmname]`
* `reimage [vmname]`

Near Future Available commands:
* `ip [vmname]`
* `delete [vmname]`
* `update [vmname]`
* `disk [vmname]`
* `ssh [vmname]`
