# Compass Schedule Widget for iPad

---

A homescreen widget for iOS/iPadOS using [Scriptable](https://scriptable.app) to display a daily schedule for [Compass School Manager](https://www.compass.education).

<img src="https://github.com/llui85/compass-ios-schedule-widget/raw/master/images/widget_light.jpeg" alt="A screenshot of the widget in light mode, using mock data." width="46%">  <img src="https://github.com/llui85/compass-ios-schedule-widget/raw/master/images/widget_dark.jpeg" alt="A screenshot of the widget in dark mode, using mock data." width="46%">

## Why?

The Compass mobile app is "okay", but not particularly convenient (the student-facing interface appears to be somewhat neglected). The app also doesn't allow for any kind of colour customisation and doesn't work online. Yes, there's an iCAL export, but it isn't updated if the room or teacher changes. This widget is designed to solve this problem - allowing you quickly view your schedule and any changes to it.

## Features:

* **Completely customisable** - change class colours, titles, and hide unwanted activity types.
* **Works offline** - schedule data is cached, so you can still view your schedule without internet.
* **Fast** - updates in less than a second as it only needs to make one HTTP request.
* **Shows class changes** - if your teacher or room has been changed, the widget updates to reflect this.
* **Doubles are grouped together** - adjacent classes within a customisable threshold can be merged together.

---

**⚠️ Warning: If your classes have multiple teachers or rooms, the widget might behave in expected ways. ⚠️**

---

## Downloading and setting up the script

1. Download [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188) from the App Store.
2. Create a new script, and copy the code in ``scriptableInstaller.js`` into it. Run the script.

## Setting up authentication

1. Log in to your Compass account as normal in **a private browsing window in Chrome or Firefox.** This should be done on your PC or Mac. You'll need to use a private window so you don't accidentally log out of the session.
2. Open the developer tools (F12 usually works)
3. - Chrome:
     1. Switch to the "Application" tab in the Developer Tools.
     2. Go to "Cookies" in the sidebar, then select your Compass domain.
     3. Copy the "Value" text in the row that begins with "ASP"
   - Firefox:
     1. Switch to the "Storage" tab in the Developer Tools.
     2. Go to "Cookies" in the sidebar, and select your Compass domain.
     3. Copy the "Value" text in the row that begins with "ASP"
4. Open `CompassWidget` in the Scriptable editor and change `sessionToken: ""` to session token you copied in Step 3.
5. Now close the private window, making sure that you **do not log out of Compass.**

You should now be able to run the script and view the widget preview.

## Adding to home screen

To add the widget to your homescreen, switch to the "Scriptable" section in the widget chooser and choose either the "large" or "extra large" sizes (smaller sizes aren't currently supported). Choose the "CompassWidget" script, and change "When Interacting" to "Run Script".

The widget will update periodically depending on device usage - this behaviour is controlled by iOS and can't be customised.

## Configuring/Customising

Modify the `widgetConfig` object to customise and configure the widget.

| Key                                               | Type                             | Description                                                                                                                                             |
| ------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessionToken`                                  | `string`                       | The session token for a valid Compass session.                                                                                                          |
| `userId`                                        | `int`                          | The userId of the schedule to view. If you're a student, you'll only be able to view your own.                                                          |
| `showCancelledEvents`                           | `bool`                         | Whether to show activities that have been cancelled.                                                                                                    |
| `showElapsedEvents`                             | `bool`                         | Whether to show activities that have concluded. Stale events may remain on the widget for a period of time if iOS does not updated the widget.          |
| `showEventTypes`                                | `[Compass.enums.ActivityType]` | Types of activites to show. Valid values are in `Compass.enums.ActivityType`                                                                          |
| `doubleThresholdMinutes`                        | `int`                          | The maxiumum amount of time (in minutes) between two activities with the same name before they are counted as a double.                                 |
| `customisations`                                | `object`                       | Activity-specific colour and titles customisations.                                                                                                     |
| `customisations.templates`                      | `object`                       | Named templates for colour and title customisation.                                                                                                     |
| `customisations.templates.{id}`                 | `object`                       | Named templates for colour and title customisation.                                                                                                     |
| `customisations.templates.{id}.backgroundColor` | `string?`, hex colour          | Background colour for that template.                                                                                                                    |
| `customisations.templates.{id}.color`           | `string?`, hex colour          | Text colour for that template.                                                                                                                          |
| `customisations.templates.{id}.accentColor`     | `string?`, hex colour          | Room text colour for that template.                                                                                                                     |
| `customisations.templates.{id}.name`            | `string?`                      | This will override the class name with the specified (mostly useful for students, who typically don't need to to identify between different faculties). |
| `customisations.mappings`                       | `object`                       | Mappings that link class names to templates. In the format of `className`: `templateId`                                                             |
| `debugUseDate`                                  | `string?`                      | Fetch the schedule for the given date in the form `YYYY-MM-DD`; mainly used for development. If omitted the current date will be used.                |

## Contributing

PRs are welcome! Please describe and justify your changes.

## License

This code is licensed under the Mozilla Public License 2.0. This means you can use and modify it as you see fit (including commercial use), providing that you **attribute** this repository.
