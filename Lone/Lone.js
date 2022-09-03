const fs = require('fs');
const readline = require('readline');
const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] })
const axios = require("axios")
const setTitle = require('node-bash-title')



const fl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

var token;

console.clear()
function get_token() {
    fl.question("Token: ", function (Token) {
		token = Token
	    client.login(Token)
    })
	
}
console.clear()
get_token()

function scrape(guild_id) {
	fs.truncate('Scrape/channels.txt', 0, function(){console.log('done')})
	fs.truncate('Scrape/roles.txt', 0, function(){console.log('done')})
	fs.truncate('Scrape/members.txt', 0, function(){console.log('done')})
	guild = client.guilds.cache.get(guild_id)
	var member_count = 0
	var channel_count = 0
	var role_count = 0
	guild.roles.cache.forEach((role) => {
		fs.appendFile('Scrape/roles.txt', role.id + "\n", err => {
			if(err) {
				console.log(err);
				return;
			}
		})
		role_count++;
	})
	
	guild.channels.cache.forEach((ch) => {
		fs.appendFile('Scrape/channels.txt', ch.id + "\n", err => {
			if(err) {
				console.log(err);
				return;
			}
		})
		channel_count++;
	})
	console.log(`Scraped Roles: ${role_count}\n`)
	console.log(`Scraped Channels: ${channel_count}\n`)
	
}


async function deleteChannels(guild_id) {
	const fileStream = fs.createReadStream('Scrape/channels.txt');
	
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	})
	
	for await (var channel of rl) {
		await axios.delete(`https://discord.com/api/v9/channels/${channel}`, {
			headers: {
				Authorization: `Bot ${token}`
			}
		}).then((res) => {
			console.log(res.data)
		})
	}
}

async function deleteRoles(guild_id) {
	const fileStream = fs.createReadStream('Scrape/roles.txt');
	
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	})
	
	for await (var role of rl) {
		await axios.delete(`https://discord.com/api/v9/guilds/${guild_id}/roles/${role}`, {
			headers: {
				Authorization: `Bot ${token}`
			}
		}).then((res) => {
			console.log(res.data)
		})
	}
}

async function createChan(guild_id) {
	const userName = JSON.stringify({ name: 'yo' })
	for (i=0; i <= 100; i++) {
		await axios.post(`https://discord.com/api/v9/guilds/${guild_id}/channels`, {
			headers: {
				Authorization: `Bot ${token}`,
			}
			
		
		}).then((res) => {
			console.log(res.data)
		})
	}
}

async function menu() {
	console.clear()
	setTitle(`[Lone] - ${client.user.tag}`)
	console.log(`
	
	ffffffffff
	
	
	|-------------------------------------------------------------------------------------------------|
	|                                                                                                 |
	|     1. Delete Channels               2. Scarpe                  3. Delete Roles                  |                                                                            |
	|-------------------------------------------------------------------------------------------------|
	
	`)
	
	
}

async function input() {
	fl.question("Choose: ", function (answer) {
		if (answer == 2) {
			fl.question("Guild Id: ", function (guild) {
				scrape(guild)
			    setTimeout(() => {
					menu()
					input()
				}, 5000) 
			})
		}
		if (answer == 1) {
			fl.question("Guild Id: ", function (guild) {
				deleteChannels(guild)
				

			    setTimeout(() => {
					menu()
					input()
				}, 5000) 
			})
		}
		if (answer == 3) {
			fl.question("Guild Id: ", function (guild) {
				deleteRoles(guild)
				

			    setTimeout(() => {
					menu()
					input()
				}, 5000) 
			})
		}
	})
}

client.on('ready', async () => {
	console.log('ready')
	console.clear()
	
	await menu()
	await input()
})

