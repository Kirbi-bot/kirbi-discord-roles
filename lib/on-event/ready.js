const chalk = require('chalk');

const guildAssignableRolesSchema = require('../../classes/guild-assignable-roles-schema');
const guildDefaultRoleSchema = require('../../classes/guild-default-role-schema');

module.exports = Kirbi => {
	const guildAssignableRoles = Kirbi.Database.model('GuildAssignableRolesSchema', guildAssignableRolesSchema);
	const guildDefaultRoles = Kirbi.Database.model('GuildDefaultRoles', guildDefaultRoleSchema);

	Kirbi.Discord.on('ready', () => {
		if (!Kirbi.Config.discord.roles) {
			Kirbi.Config.discord.roles = [];
		}

		guildAssignableRoles.find((err, guildSettings) => {
			if (err) {
				console.log(chalk.red(`Error: ${err}`));
				return false;
			}

			guildSettings.forEach(settings => {
				const guild = Kirbi.Discord.guilds.find('id', settings.guildId);

				if (guild) {
					if (!Kirbi.Config.discord.roles[settings.guildId]) {
						Kirbi.Config.discord.roles[settings.guildId] = {};
					}

					Kirbi.Config.discord.roles[settings.guildId].assignable = settings.roleIds;
				}
			});

			return true;
		});

		guildDefaultRoles.find((err, guildSettings) => {
			if (err) {
				console.log(chalk.red(`Error: ${err}`));
				return false;
			}

			guildSettings.forEach(settings => {
				const guild = Kirbi.Discord.guilds.find('id', settings.guildId);

				if (guild) {
					if (!Kirbi.Config.discord.roles[settings.guildId]) {
						Kirbi.Config.discord.roles[settings.guildId] = {};
					}

					Kirbi.Config.discord.roles[settings.guildId].default = settings.roleId;
				}
			});

			return true;
		});
	});
};
