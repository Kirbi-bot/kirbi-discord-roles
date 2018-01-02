const chalk = require('chalk');

const guildAssignableRolesSchema = require('./classes/guild-assignable-roles-schema');

module.exports = Kirbi => {
	Kirbi.Config.roles = [];
	require('./lib/on-event')(Kirbi);

	function createEmbed(info) {
		const ret = {
			embed: {
				color: Kirbi.Config.discord.defaultEmbedColor,
				author: {
					name: 'Role Manager',
					icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png'
				},
				description: info
			}
		};

		return ret;
	}

	return {
		commands: [
			'iam',
			'iamnot',
			'role'
		],
		iam: {
			usage: '',
			description: '',
			process: (msg, suffix, isEdit, cb) => {
				if (!isEdit) {
					const role = msg.guild.roles.find(r => r.name.toLowerCase() === suffix);
					const guildRoles = Kirbi.Config.discord.roles[msg.guild.id];

					if (guildRoles) {
						const roles = guildRoles.assignable;

						if (roles && roles.includes(role.id)) {
							msg.member.addRole(role.id);

							cb(createEmbed(`Added ${role.name} to your roles.`), msg);
						}
					}
				}
			}
		},
		iamnot: {
			usage: '',
			description: '',
			process: (msg, suffix, isEdit, cb) => {
				if (!isEdit) {
					const role = msg.guild.roles.find(r => r.name.toLowerCase() === suffix);
					const guildRoles = Kirbi.Config.discord.roles[msg.guild.id];

					if (role && guildRoles) {
						const roles = guildRoles.assignable;

						if (roles && roles.includes(role.id)) {
							msg.member.removeRole(role.id);

							cb(createEmbed(`Removed ${role.name} from your roles.`), msg);
						}
					}
				}
			}
		},
		role: {
			usage: 'add|remove|default|list <role name>',
			description: '',
			process: (msg, suffix, isEdit, cb) => {
				if (!isEdit) {
					const guildAssignableRolesSet = Kirbi.Database.model('GuildAssignableRolesSchema', guildAssignableRolesSchema);

					const params = suffix.split(' ');
					const command = params.shift();
					suffix = params.join(' ');

					let guildRoles = Kirbi.Config.discord.roles[msg.guild.id];

					if (!guildRoles) {
						Kirbi.Config.discord.roles[msg.guild.id] = {};
						Kirbi.Config.discord.roles[msg.guild.id].assignable = [];

						guildRoles = Kirbi.Config.discord.roles[msg.guild.id];
					}

					const roles = guildRoles.assignable;

					switch (command) {
						case 'add':
							if (msg.member.hasPermission('MANAGE_ROLES')) {
								try {
									const role = msg.guild.roles.find(r => r.name.toLowerCase() === suffix);

									if (role) {
										if (!roles.includes(role.id)) {
											guildAssignableRolesSet.findOneAndUpdate({ guildId: msg.guild.id }, { $addToSet: { roleIds: role.id } }, { upsert: true }, (err, result) => {
												if (err) {
													chalk.red(err);
													cb(`Error saving role.`, msg);
												} else {
													if (!result) {
														result = guildAssignableRolesSchema;
														result.roleIds = [role.id];
													}

													result.save();

													console.log(chalk.blue(`Added ${role.name}:${role.id} on ${msg.guild.name}:${msg.guild.id} to self-assignable list.`));

													Kirbi.Config.discord.roles[msg.guild.id].assignable.push(role.id);
													cb(`Added role <@${role.id}> to self-assignable list.`, msg);
												}
											});
										} else {
											cb(createEmbed(`Already assigned.`), msg);
										}
									} else {
										cb(createEmbed(`Not a valid role.`), msg);
									}
								} catch (err) {
									console.log(chalk.red(`Error: ${err}`));
								}
							}

							break;
						case 'remove':
							if (msg.member.hasPermission('MANAGE_ROLES')) {
								try {
									const role = msg.guild.roles.find(r => r.name.toLowerCase() === suffix);

									if (role) {
										if (!roles.includes(role.id)) {
											guildAssignableRolesSet.update({ guildId: msg.guild.id }, { $pullAll: { roleIds: role.id } }, err => {
												if (err) {
													console.log(chalk.red(`Error: ${err}`));
													cb(`Error removing role.`, msg);
												} else {
													console.log(chalk.blue(`Removed ${role.name}:${role.id} on ${msg.guild.name}:${msg.guild.id} from self-assignable list.`));
													Kirbi.Config.discord.roles[msg.guild.id].assignable.splice(Kirbi.Config.roles[msg.guild.id].assignable.indexOf(role.id), 1);
													cb(createEmbed(`Removed <@${role.id}> from self-assignable list.`), msg);
												}
											});
										} else {
											cb(createEmbed(`This role is not self-assignable.`), msg);
										}
									} else {
										cb(createEmbed(`Not a valid role.`), msg);
									}
								} catch (err) {
									console.log(chalk.red(`Error ${err}`));
								}
							}

							break;
						case 'default':

							break;
						case 'list':

							break;
						default:
							break;
					}
				}
			}
		}
	};
};
