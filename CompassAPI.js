"use strict"

// javascript port of https://github.com/llui85/compass-api-client with promises

class CompassAPI {
	constructor(fqdn) {
		this.fqdn = fqdn
		this.sessionToken = null
	}

	setAuthToken(sessionToken) {
		this.sessionToken = sessionToken
	}

	post(path, data = {}) {
		let url = `https://${this.fqdn}${path}`
		let apiRequest = new Request(url)
		apiRequest.method = "POST"
		apiRequest.headers = {
			"Cookie": `ASP.NET_SessionId=${this.sessionToken}`,
			"Content-Type": "application/json; charset=utf-8",
			"Accept": "application/json, text/javascript, */*; q=0.01",
			"X-Requested-With": "iOS-Scriptable-by-llui85-on-GitHub"
		}
		apiRequest.body = JSON.stringify(data)
		return new Promise((resolve, reject) => {
			apiRequest.loadJSON().then(data => {
				resolve(data)
			});
		});
	}

	postWithCallback(path, data = {}, callback) {
		this.post(path, data).then(data => {
			callback(data)
		})
	}

	// basic enums copied from the compass web client (https://jdlf-compass-scripts.pages.dev/Compass.Base.js)
	enums = {
		ActivityType: {
			StandardClass: 1,
			Event: 2,
			Meeting: 3,
			Assembly: 4,
			GenericActivity: 5,
			CalendarItem: 7,
			GenericGroup: 8,
			ProfessionalDevelopment: 9,
			LearningTask: 10,
			Exam: 11,
			OnCall: 12
		},
		InstanceRunningStatus: {
			Cancelled: 0,
			Running: 1,
			Draft: 2
		}
	}
}

module.exports = CompassAPI
