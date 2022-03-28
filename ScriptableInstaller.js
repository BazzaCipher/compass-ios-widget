const url = 'https://raw.githubusercontent.com/BazzaCipher/compass-ios-widget/master/';

const fmlocal = FileManager.local();
const fmcloud = FileManager.iCloud();

const installDir = fmlocal.joinPath(fmlocal.libraryDirectory(), 'Compass_Resources');
const scriptableDir = fmcloud.documentsDirectory();

function hashCode(input) {
  return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0)
}

function installScript(name, uinfo) {
  // Installs a script direct from github
  const req = new Request(url + name);
  const code = await req.loadString();

  if (uinfo.hasOwnProperty('userId')) {
    code.replace('userId: 0', `userId: ${uinfo.userId}`)
  }
  if (uinfo.hasOwnProperty('domain')) {
    code.replace('yourdomain.compass.education', domain)
  }

  const hash = hashCode(code);
  const codetostore = `// icon-glyph: compass;\n// This script was downloaded with inspiration from ScriptDude.\n// Do not remove these lines, if you want to benefit from automatic updates.\n// source: ${url}; hash: ${hash};\n\n${code}`;

  fmcloud.writeString(fmcloud.joinPath(scriptableDir, name), codetostore);
}

function installResource(name) {
  // Install fixed resources
  const req = new Request(url + "/Compass_Resources/" + name);
  const data = await req.load();

  fmlocal.write(fmlocal.joinPath(installDir, name), data)
}

async function userInfo () {
  const wv = new WebView()
  await wv.loadURL("https://schools.compass.education/")

  return {
    userId: await wv.evaluateJavascript('Compass.post("/Services/Mobile.svc/UpgradeSamlSession"); completion(Compass.organisationUserId)', true),
    domain: await wv.evaluateJavascript('document.domain'),
  }
}

async function installAll() {
  // Install all scripts
  if (fmlocal.isDirectory(installDir)) {
    fmlocal.createDictory(installDir, true)
  }
  try {
    const info = await userInfo()
    if (!info.domain.includes('compass.education')) {
      throw new Error('Please sign in')
    }

    installScript('CompassAPI.js')
    installScript('CompassWidget.js', info)
    installResource('compassLogoSmall_DARK.png')
    installResource('compassLogoSmall_LIGHT.png')
    installResource('compassLogo_DARK.png')
    installResource('compassLogo_LIGHT.png')    

    // Delete itself
    let selfFilePath = fmcloud.joinPath(this.documentsDirectory, Script.name() + '.js');
    fmcloud.remove(selfFilePath);
  } catch (e) {
    console.error(e)
  }
}

installAll()