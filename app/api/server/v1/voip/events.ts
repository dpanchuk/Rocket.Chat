
import { Match, check } from 'meteor/check';

import { API } from '../../api';
import { Voip } from '../../../../../server/sdk';
import { canAccessRoom } from '../../../../authorization/server';
import { VoipRoom } from '../../../../models/server/raw';

API.v1.addRoute('voip/events', { authRequired: true }, {
	async post() {
		check(this.requestParams(), {
			event: Match.OneOf('voip-call-started'),
			rid: String,
			comment: Match.Maybe(String),
		});

		const { rid, event, comment } = this.requestParams();

		const room = await VoipRoom.findOneVoipRoomById(rid);
		if (room) {
			if (!canAccessRoom(room, this.user)) {
				return API.v1.unauthorized();
			}
			return Voip.handleEvent(event, room, this.user, comment);
		}
		return API.v1.notFound();
	},
});