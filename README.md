# Compass Schedule Widget for iPad

## Pre-setup

1. Download [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188) from the App Store.
2. Create a new script in Scriptable, and copy the code in `CompassWidget.js` into it, making sure that this script is named `CompassWidget`.
3. Create a new script in Scriptable, and copy the code in `CompassAPI.js` into it, making sure that this script is named `CompassWidget`.
4. Download `Compass_Resources.zip` into "On My iPad/iPhone" and decompress it.
5. Go to Scriptable Settings > File Bookmarks and select "Pick Folder". Choose the Compass_Resources folder you just decompressed, keeping the name as `Compass Resources.`

## Setup
1. Log in to your Compass account as normal in **a private browsing window in Chrome or Firefox.**
2. Open the developer tools console.
3. Paste the following code and press enter. Note down the number that is output in the console:

```js
Compass.postWithCallback("/Services/Mobile.svc/UpgradeSamlSession", {}, d => console.log(Compass.organisationUserId))
```

4. Follow the below steps depending on your browser:
   - Chrome:
      1. Switch to the "Application" tab in the Developer Tools.
      2. Go to "Cookies" in the sidebar, then select your Compass domain.
      3. Copy the "Value" text in the row that begins with "ASP"
   - Firefox:
      1. Switch to the "Storage" tab in the Developer Tools.
      2. Go to "Cookies" in the sidebar, and select your Compass domain.
      3. Copy the "Value" text in the row that begins with "ASP"

5. Open `CompassWidget` in the Scriptable editor and change these things:
  1. The line that looks like `yourdomain.compass.education` should be changed to your school's compass domain.
  2. The number in `userId: 0` should be changed to the number you got in Step 3.
  3. The line that looks like `sessionToken: ""` should be changed to include the value you copied in Step 4
6. Now close the private window, making sure that you **do not log out of Compass.**

You should now be able to run the widget successfully.

Modify the `widgetConfig` object to customise what is shown in the widget and to set custom colours.
