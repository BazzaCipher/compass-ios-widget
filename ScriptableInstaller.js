const url = 'https://raw.githubusercontent.com/BazzaCipher/compass-ios-widget/master/';

const fmlocal = FileManager.local();
const fmcloud = FileManager.iCloud();

const installDir = fmlocal.joinPath(fmlocal.libraryDirectory(), 'Compass_Resources');
const scriptableDir = fmcloud.documentsDirectory();

function hashCode(input) {
  return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0)
}

async function installScript(name) {
  // Installs a script direct from github
  const req = new Request(url + name);
  const code = await req.loadString();
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

async function installConfigs(name) {
  // Install fixed and malleable configs
  const req = new Request(url + name);
  const data = await req.loadJson();

  fmlocal.write(fmlocal.joinPath(installDir, name), data)
  fmcloud.write(fmcloud.joinPath(scriptableDir, name), data)
}

async function installAll() {
  // Install all scripts
  if (fmlocal.isDirectory(installDir)) {
    fmlocal.createDictory(installDir, true)
  }
  try {
    await installScript('CompassAPI.js')
    await installScript('CompassWidget.js')
    await installResource('compassLogoSmall_DARK.png')
    await installResource('compassLogoSmall_LIGHT.png')
    await installResource('compassLogo_DARK.png')
    await installResources('compassLogo_LIGHT.png')
  } catch (e) {
    console.error(e)
  }

  // Delete itself
}