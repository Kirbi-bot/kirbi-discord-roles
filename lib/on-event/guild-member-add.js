const chalk = require('chalk');

module.exports = Kirbi => {
	Kirbi.Discord.on('guildMemberAdd', (guild, member) => {
		if (Kirbi.Discord.roles && Object.keys(Kirbi.Discord.roles).includes(guild.id) && Kirbi.Discord.roles[guild.id].default) {
			const role = guild.getRole(Kirbi.Discord.roles[guild.id].default);

			if (role) {
				console.log(chalk.blue(`Added default role ${role.name}:${role.id} to ${member.name}:${member.id} on ${guild.name}:${guild.id}`));
				member.addRole(role);
			} else {
				console.log(chalk.red(`Default role for ${guild.name}:${guild.id} is not configured properly.`));
			}
		}
	});
};
