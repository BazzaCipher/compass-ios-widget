const url = 'https://raw.githubusercontent.com/BazzaCipher/compass-ios-widget/master/';

const fmlocal = FileManager.local();
const fmcloud = FileManager.iCloud();

const installDir = fmlocal.joinPath(fmlocal.libraryDirectory(), 'Compass_Resources');
const scriptableDir = fmcloud.documentsDirectory();

function hashCode(input) {
  return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0)
}

async function installScript(name, uinfo) {
  // Installs a script direct from github
  const req = new Request(url + name);
  let code = await req.loadString();

  if (uinfo.hasOwnProperty('userId')) {
    code = code.replace('userId: 0', `userId: ${uinfo.userId}`)
  }
  if (uinfo.hasOwnProperty('domain')) {
    code = code.replace('yourdomain.compass.education', uinfo.domain)
  }

  const hash = hashCode(code);
  const codetostore = `// icon-glyph: compass;\n// This script was downloaded with inspiration from ScriptDude.\n// Do not remove these lines, if you want to benefit from automatic updates.\n// source: ${url}; hash: ${hash};\n\n${code}`;

  fmcloud.writeString(fmcloud.joinPath(scriptableDir, name), codetostore);
}

async function installResource(name) {
  // Install fixed resources
  const req = new Request(url + "/Compass_Resources/" + name);
  const data = await req.load();

  fmlocal.write(fmlocal.joinPath(installDir, name), data)
}

async function userInfo () {
  const wv = new WebView()
  await wv.loadURL("https://schools.compass.education/")
  await wv.present(true)

  return await wv.evaluateJavaScript("(()=>{try{Compass.post('/Services/Accounts.svc/GetAccount').then(({d}) => completion({userId: d.userId,domain: document.domain}));return}catch(e){return -1}})()", true)
}

async function installAll() {
  // Install all scripts
  if (!fmlocal.isDirectory(installDir)) {
    fmlocal.createDictory(installDir, true)
  }
  try {
    const info = await userInfo()
    if (!info)
      throw new Error('Please sign into your school')

    await installScript('CompassAPI.js')
    await installScript('CompassWidget.js', info)
    await installResource('compassLogoSmall_DARK.png')
    await installResource('compassLogoSmall_LIGHT.png')
    await installResource('compassLogo_DARK.png')
    await installResource('compassLogo_LIGHT.png')    

    // Delete itself
    let selfFilePath = fmcloud.joinPath(scriptableDir, Script.name() + '.js');
    await fmcloud.remove(selfFilePath);

    let callback = new CallbackURL("scriptable:///run");
    await callback.addParameter("scriptName", "CompassWidget.js");
    await callback.open();
  } catch (e) {
    console.error(e)
  }
}

installAll()