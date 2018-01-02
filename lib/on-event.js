module.exports = function (Kirbi) {
	require('./on-event/ready')(Kirbi);
	require('./on-event/guild-member-add')(Kirbi);
};
