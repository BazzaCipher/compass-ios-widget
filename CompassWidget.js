"use strict"

const CompassAPI = importModule("CompassAPI")
let Compass = new CompassAPI(
	"yourdomain.compass.education"
)

// Configuration

let widgetConfig = {
	// a valid compass session token - the cookie "ASP.NET_SessionId"
	sessionToken: "",
	// your compass userId - you can get it by running "Compass.organisationUserId" in devtools
	userId: 0,
	// whether to show events that have been cancelled
	showCancelledEvents: false,
	// whether to show events which have already finished
	showElapsedEvents: true,
	// which types of events to show
	showEventTypes: [
		Compass.enums.ActivityType.StandardClass,
		Compass.enums.ActivityType.Event,
		Compass.enums.ActivityType.Meeting,
		Compass.enums.ActivityType.Assembly,
		Compass.enums.ActivityType.GenericActivity,
	//	Compass.enums.ActivityType.CalendarItem,
		Compass.enums.ActivityType.GenericGroup,
		Compass.enums.ActivityType.ProfessionalDevelopment,
		Compass.enums.ActivityType.LearningTask,
		Compass.enums.ActivityType.Exam,
		Compass.enums.ActivityType.OnCall
	],
	// the maximum gap between two classes with the same name before they are not grouped together (a double)
	doubleThresholdMinutes: 15,
	// colour and name customisations for events with a specific title
	customisations: {
		templates: {
			"english": {
				backgroundColor: "#ff9700",
				color: "#000000",
				accentColor: "#000000",
				name: "English"
			},
			"geography": {
				backgroundColor: "#973000",
				color: "#ffff00",
				accentColor: "#ffff00",
				name: "Geography"
			},
			"tutor": {
				backgroundColor: "#a8a8a8",
				color: "#000000",
				accentColor: "#000000",
				name: "Tutor"
			},
			"sport": {
				backgroundColor: "#28a10a",
				color: "#FFF",
				accentColor: "#FFF",
				name: "Sport"
			},
			"pdhpe": {
				backgroundColor: "#28a10a",
				color: "#FFF",
				accentColor: "#FFF",
				name: "PDHPE"
			},
			"maths": {
				backgroundColor: "#ff0000",
				color: "#ffffff",
				accentColor: "#ffffff",
				name: "Maths"
			},
			"music": {
				backgroundColor: "#faf859",
				color: "#000000",
				accentColor: "#000000",
				name: "Music"
			},
			"stem": {
				backgroundColor: "#0000ff",
				color: "#ffff00",
				accentColor: "#ffff00",
				name: "STEM"
			},
			"science": {
				backgroundColor: "#17a18f",
				color: "#000000",
				accentColor: "#000000",
				name: "Science"
			},
			"religion": {
				backgroundColor: "#007007",
				color: "#ffffff",
				accentColor: "#ffffff",
				name: "Religion"
			},
			"art": {
				backgroundColor: "#7f0075",
				color: "#ffffff",
				accentColor: "#ffffff",
				name: "Art"
			},
			"french": {
				backgroundColor: "#ffdbb6",
				color: "#000000",
				accentColor: "#000000",
				name: "French"
			},
			"technology": {
				backgroundColor: "#0000ff",
				color: "#ffff00",
				accentColor: "#ffff00",
				name: "Technology"
			}
		},
		mappings: {
			"ENG":		"english",
			"SCI":		"science",
		}
	},
	// uncomment this line to set the date manually instead of using the current date. for development purposes
	//debugUseDate: '2021-09-07'
}

// End of configuration

Compass.sessionToken = widgetConfig.sessionToken
Promise.all([
	Compass.post("/Services/Calendar.svc/GetCalendarEventsByUser", {
		activityId: null,
		startDate: getCurrentDate(),
		endDate: getCurrentDate(),
		homePage: true,
		limit: 100,
		start: 0,
		page: 1,
		userId: widgetConfig.userId,
	}),
	//Compass.post("/Services/Mobile.svc/UpgradeSamlSession")
]).then(results => {

	cacheResponse(results[0], `${getCurrentDate()}-calendar.json`)

	results = parseAndFilterCalendarResponse(results[0])

	let widget = createWidget(results)
	Script.setWidget(widget)
	widget.presentLarge()
	Script.complete()
}).catch(e => {
	console.error(e)

	if (["SyntaxError", "TypeError", "ReferenceError"].includes(e.name)) throw 'Fatal Error';

	let cacheData = getCachedResponse(`${getCurrentDate()}-calendar.json`)

	if (cacheData.exists) {
		let data = parseAndFilterCalendarResponse(cacheData.data)
		let widget = createWidget(data, cacheData.modificationTime)
		Script.setWidget(widget)
		widget.presentLarge()
		Script.complete()
	} else {
		let widget = createWidget([], new Date(), true)
		Script.setWidget(widget)
		widget.presentLarge()
		Script.complete()
	}
}).catch(e => {
	console.error(e)
});

function createWidget(activities, offlineDataModificationTime = null, isOfflineAndNoData = false) {

	let widget = new ListWidget();

	//let widgetLightBackgroundColor = new Color("#DDD");
	let widgetLightBackgroundColor = new Color("#EEE");
	let widgetDarkBackgroundColor = new Color("#333");

	let lineDefaultBackgroundColorLight = new Color("#FFF")
	let lineDefaultBackgroundColorDark = new Color("#222")

	let lineDefaultColorLight = new Color("#333");
	let lineDefaultColorDark = new Color("#EEE");

	let lineDefaultAccentColorLight = new Color("#333");
	let lineDefaultAccentColorDark = new Color("#FFFF00");

	widget.backgroundColor = Color.dynamic(
		widgetLightBackgroundColor,
		widgetDarkBackgroundColor
	);
	widget.setPadding(5, 5, 5, 5);

	let mainFont = Font.body();

	let currentDate = new Date()
	let formatOptions = {
		hour: "2-digit",
		minute: "2-digit"
	}

	let previousActivity = null
	let lineCount = 0;
	for (let i of activities) {
		let sessionCount = 0
		for (let session of i.sessions) {
			let startDate = new Date(i.start)
			let finishDate = new Date(i.finish)

			let eventFinished = finishDate <= currentDate;

			if (eventFinished && !widgetConfig.showElapsedEvents) {
				continue;
			}

			sessionCount++;
		}

		if (sessionCount === 0) continue;

		let line = widget.addStack()
		let lineBackgroundColor = Color.dynamic(lineDefaultBackgroundColorLight, lineDefaultBackgroundColorDark)
		let lineColor = Color.dynamic(lineDefaultColorLight, lineDefaultColorDark)
		let lineAccentColor = Color.dynamic(lineDefaultAccentColorLight, lineDefaultAccentColorDark)

		let eventName = i.name;
		if (eventName in widgetConfig.customisations.mappings) {
			let template = widgetConfig.customisations.templates[widgetConfig.customisations.mappings[eventName]];
			if (template !== undefined) {
				if ("backgroundColor" in template) {
					lineBackgroundColor = new Color(template.backgroundColor)
				}
				if ("color" in template) {
					lineColor = new Color(template.color)
				}
				if ("accentColor" in template) {
					lineAccentColor = new Color(template.accentColor)
				}
				if ("name" in template) {
					eventName = template.name
				}
			}
		}

		line.backgroundColor = lineBackgroundColor;
		line.setPadding(6, 11, 6, 13)
		line.cornerRadius = 15

		if (i.activityId) {
				line.url = `https://${Compass.fqdn}/Organise/Activities/Activity.aspx?targetUserId=${widgetConfig.userId}#activity/${i.activityId}`;
		}

		let lineContent = line.addStack()
		lineContent.layoutHorizontally()
		lineContent.centerAlignContent()

		let lineLeftContent = lineContent.addStack()
		lineLeftContent.layoutVertically()

		eventName = lineLeftContent.addText(eventName)
		eventName.font = Font.mediumSystemFont(13)
		eventName.textColor = lineColor

		for (let session of i.sessions) {
			let sessionStack = lineContent.addStack()
			sessionStack.layoutHorizontally()
			sessionStack.centerAlignContent()

			let startDate = new Date(session.start)
			let finishDate = new Date(session.finish)
			let formattedStart = startDate.toLocaleTimeString(
				'en-US',
				formatOptions
			)
			let formattedFinish = finishDate.toLocaleTimeString(
				'en-US',
				formatOptions
			)

			let eventDetailsStack = lineLeftContent.addStack()
			eventDetailsStack.spacing = 4
			let eventDetailsFont = Font.regularMonospacedSystemFont(9)

			let eventTime = eventDetailsStack.addText(`${formattedStart} - ${formattedFinish}`)
			eventTime.font = eventDetailsFont
			eventTime.textColor = lineColor

			if (session.teacher.current) {
				let tiiStack = eventDetailsStack.addStack();
				let openTiiPar = tiiStack.addText("(");
		 		if (session.teacher.old) {
		 			let oldTeacherStack = tiiStack.addStack();
		 			oldTeacherStack.backgroundGradient = calculateStrikethroughGradient(lineAccentColor, 8);

		 			let oldTeacherImportIdentifier = oldTeacherStack.addText(session.teacher.old)
					oldTeacherImportIdentifier.font = eventDetailsFont
		 			oldTeacherImportIdentifier.textColor = lineColor
		 			tiiStack.addSpacer(4)
					let teacherImportIdentifier = tiiStack.addText(session.teacher.current)
		 			teacherImportIdentifier.font = Font.boldSystemFont(9)
		 			teacherImportIdentifier.textColor = lineColor
		 		} else {
		 			let teacherImportIdentifier = tiiStack.addText(session.teacher.current)
		 			teacherImportIdentifier.font = eventDetailsFont
		 			teacherImportIdentifier.textColor = lineColor
				}
				let closeTiiPar = tiiStack.addText(")");

				openTiiPar.font = eventDetailsFont
				closeTiiPar.font = eventDetailsFont
				openTiiPar.textColor = lineColor
				closeTiiPar.textColor = lineColor
			}
		}

		lineContent.addSpacer()

		let locationFont = Font.boldSystemFont(10)

		let locationSessionStack = lineContent.addStack()
		locationSessionStack.layoutVertically()

		locationSessionStack.spacing = 5

		let locationSessions = i.sessions;

		if (
			locationSessions.length > 1 &&
			locationSessions.every(
				(v, i, a) => v.location.old === a[0].location.old
			) &&
			locationSessions.every(
				(v, i, a) => v.location.current === a[0].location.current
			)
		) {
			locationSessions = [i.sessions[0]]
		}

		locationSessionStack.addSpacer(3)
		for (let session of locationSessions) {
			if (session.location.current) {
				let currentSessionLocationStack = locationSessionStack.addStack()
				if (session.location.old) {
					let locationStack = currentSessionLocationStack.addStack()
					let oldLocationStack = locationStack.addStack();
					locationStack.spacing = 6
					oldLocationStack.backgroundGradient = calculateStrikethroughGradient(lineAccentColor, 10)

					let oldLocation = oldLocationStack.addText(session.location.old)
					oldLocation.font = locationFont
					oldLocation.textColor = lineAccentColor

					let eventLocation = locationStack.addText(session.location.current)
					eventLocation.font = locationFont
					eventLocation.textColor = lineAccentColor
				} else {
					let eventLocation = currentSessionLocationStack.addText(session.location.current)
					eventLocation.font = locationFont
					eventLocation.textColor = lineAccentColor
				}
			}
		}

		locationSessionStack.addSpacer(3)

		previousActivity = i
		lineCount++;

		// add a little padding below the line
		if (lineCount !== activities.length) {
			widget.addSpacer(5)
		}
	}

	if (lineCount === 0) {
		widget.addSpacer();
		if (isOfflineAndNoData) {
			let offlineText = widget.addText("Offline")
			offlineText.textColor = Color.dynamic(
				new Color("#F00"),
				new Color("#F88")
			)

			offlineText.font = Font.boldSystemFont(50)
			offlineText.centerAlignText()

			widget.addSpacer(4)

			let cacheExplainer = widget.addText("Data has not been cached yet.")
			cacheExplainer.centerAlignText()
			cacheExplainer.font = Font.mediumSystemFont(10)
			cacheExplainer.textColor = Color.dynamic(
				new Color("#F00"),
				new Color("#F88")
			)
		} else {
			let compassLogo = getDynamicAssetById("compassLogo")
			let doneIconImage = widget.addImage(compassLogo)
			doneIconImage.imageSize = new Size(100, 100)
			doneIconImage.centerAlignImage()
			doneIconImage.imageOpacity = 0.2;
		}
	}

	widget.addSpacer();

	let borderTopBG = new LinearGradient()
	let gradientColor1 = Color.dynamic(
		new Color("#333333FF"),
		new Color("#FFFFFFFF")
	)
	let gradientColor2 = Color.dynamic(
		new Color("#33333300"),
		new Color("#FFFFFF00")
	)

	borderTopBG.colors = [
		gradientColor1,
		gradientColor1,
		gradientColor2,
		gradientColor2,
	]

	borderTopBG.locations = [
		0,
		0.04,
		0.041,
		1
	]

	let status = widget.addStack()
	status.setPadding(5, 6, 3, 6)
	status.backgroundGradient = borderTopBG

	let compassLogo = getDynamicAssetById("compassLogoSmall")
	compassLogo = status.addImage(compassLogo)
	compassLogo.imageSize = new Size(12, 12)

	status.addSpacer(4)

	let statusFont = Font.regularMonospacedSystemFont(10)

	if (offlineDataModificationTime !== null) {
		let statusText = "Offline - Last updated at: ".toUpperCase();
		statusText = status.addText(statusText)
		statusText.font = Font.boldMonospacedSystemFont(10);
		statusText.textColor = Color.dynamic(
			new Color("#F00"),
			new Color("#F88")
		)

		let lastUpdated = offlineDataModificationTime.toLocaleTimeString(
				'en-US',
				formatOptions
		)
		lastUpdated = status.addText(lastUpdated)
		lastUpdated.font = statusFont
	} else {
		let statusText = "Last updated: ".toUpperCase();
		statusText = status.addText(statusText)
		statusText.font = statusFont;

		let lastUpdated = currentDate.toLocaleTimeString(
				'en-US',
				formatOptions
		)
		lastUpdated = status.addText(lastUpdated)
		lastUpdated.font = statusFont
	}

	status.addSpacer()

	let dateStatus = status.addText(getCurrentDate())
	dateStatus.font = statusFont;

	return widget
}

function getCurrentDate() {
	if (widgetConfig.debugUseDate) return widgetConfig.debugUseDate;

	let localDate = new Date()
	localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
	return localDate.toJSON().slice(0, 10)
}

function getDynamicAssetById(assetId) {
	let fmg = FileManager.local()
	let resourceDir = fmg.bookmarkedPath("Compass_Resources")
	let img;
	if (Device.isUsingDarkAppearance()) {
		img = fmg.readImage(`${resourceDir}/${assetId}_DARK.png`)
	} else {
		img = fmg.readImage(`${resourceDir}/${assetId}_LIGHT.png`)
	}
	return img
}

function cacheResponse(data, filename) 	{
	let fmg = FileManager.local()
	let resourceDir = fmg.bookmarkedPath("Compass_Resources")
	let cachePath = `${resourceDir}/cache`
	if (!fmg.fileExists(cachePath)) fmg.createDirectory(`${resourceDir}/cache`);

	data = JSON.stringify(data)
	fmg.writeString(`${cachePath}/${filename}`, data)
}

function getCachedResponse(filename) {
	let fmg = FileManager.local()
	let resourceDir = fmg.bookmarkedPath("Compass_Resources")
	let cachePath = `${resourceDir}/cache`

	let data = "null"
	let modificationTime = new Date()
	let exists = false;

	let filePath = `${cachePath}/${filename}`
	if (fmg.fileExists(filePath)) {
		data = fmg.readString(filePath)
		modificationTime = fmg.modificationDate(`${cachePath}/${filename}`)
		exists = true
	}
	data = JSON.parse(data)
	return { data, modificationTime, exists }
}

function parseAndFilterCalendarResponse(response) {
	let results = response.d
	if (!widgetConfig.showCancelledEvents) {
		results = results.filter(i => i.runningStatus !== 0);
	}
	results = results.filter(i => {
		return widgetConfig.showEventTypes.includes(i.activityType)
	});

 	if (!widgetConfig.showElapsedEvents) {
 		results = results.filter(i => {
 			let eventFinished = new Date(i.finish) > new Date();
			return (eventFinished && !widgetConfig.showElapsedEvents);
 		});
	}

	results = results.map(activity => {
		let titleElements = activity.longTitleWithoutTime.split(" - ")

		let location;
		let oldLocation = null;

		let teacherImportIdentifier;
		let oldTeacherImportIdentifier = null;

		let changedExpr = /<strike>(.*)<\/strike>&nbsp; (.*)/

		// if the event title has a hyphen it will trip up the splitter, so fix it up here
		if (titleElements[0] !== activity.title) {
			titleElements.splice(1, 1);
			titleElements[0] = activity.title;
		}

		if (activity.activityType === 7) {
		// a calendar item - don't parse the title
			teacherImportIdentifier = null;
			location = null;
		} else if (titleElements.length == 3) {
		// title is in the form of "CII - LOC - TII"
			teacherImportIdentifier = titleElements[2]
			location = titleElements[1]

			let locationChanges = location.match(changedExpr)
			if (locationChanges) {
				oldLocation = locationChanges[1]
				location = locationChanges[2]
			}

			let teacherChanges = teacherImportIdentifier.match(changedExpr)
			if (teacherChanges) {
				oldTeacherImportIdentifier = teacherChanges[1]
				teacherImportIdentifier = teacherChanges[2]
			}
		} else if (titleElements.length == 2) {
		// title is in the form of "CII - TII"
			teacherImportIdentifier = titleElements[1]
			location = null

			let teacherChanges = teacherImportIdentifier.match(changedExpr)
			if (teacherChanges) {
				oldTeacherImportIdentifier = teacherChanges[1]
				teacherImportIdentifier = teacherChanges[2]
			}
		} else {
			console.log(warn.longTitleWithoutTime)
		}

		let isCancelled = activity.runningStatus === 0
		return {
			name: activity.title,
			activityId: activity.activityId,
			sessions: [
				{
					start: activity.start,
					finish: activity.finish,
					instanceId: activity.instanceId,
					location: {
						old: oldLocation,
						current: location
					},
					teacher: {
						old: oldTeacherImportIdentifier,
						current: teacherImportIdentifier
					},
					isCancelled: isCancelled
				}
			]
		}
	});
	results = results.sort((a, b) => {
		return a.sessions[0].start.localeCompare(b.sessions[0].start)
	});
	let timeMaps = results.map((d, i) => {
		return [i, d.name, d.sessions[0].start, d.sessions[0].finish]
	});
	for (let i of timeMaps) {
		for (let j of timeMaps) {
			/*	j is the first period, to which we add the session from i
				i is the second period - which we delete
				A period looks like [4, "12MM02", DateA, DateB...],
				where DateA < DateB (in Unix time)
			*/
			if (i[0] > j[0] && i[1] === j[1]) {
				let jfinish = new Date(j[3])
				let istart = new Date(i[2])

				let gap = Math.round(((istart - jfinish % 86400000) % 3600000) / 60000)

				if (widgetConfig.doubleThresholdMinutes >= gap) {
					results[j[0]].sessions.push(results[i[0]].sessions.shift())
				}
			}
		}
	}
	return results
}

function calculateStrikethroughGradient(color, height) {
	let bg = new LinearGradient()
	let c1 = color
	let transparent = new Color("#000000", 0)

	bg.colors = [
		transparent,
		transparent,
		c1,
		c1,
		transparent,
		transparent
	]

	bg.locations = [
		0,
		0.52 - (height / 200) - 0.005, // fix scriptable rendering bug with adjacent gradient locations
		0.52 - (height / 200),
		0.52 + (height / 200),
		0.52 + (height / 200) + 0.005,
		1
	]

	return bg
}
