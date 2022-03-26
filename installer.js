const url = 'https://raw.githubusercontent.com/BazzaCipher/compass-ios-widget/master/';

const fmlocal = FileManager.local();
const fmcloud = FileManager.iCloud();

const installDir = fmlocal.joinPath(fmlocal.documentsDirectory(), 'Compass_Resources');
const scriptableDir = fmcloud.documentsDirectory();

function hashCode(input) {
  return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0)
}

async function installScript(name, dir, sourceURL) {
  // Installs a script direct from github
  const req = new Request(`${sourceURL}${name}.js`);
  const code = await req.loadString();
  const hash = hashCode(code);
  const codetostore = `// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-glyph: compass;\n// This script was downloaded with inspiration from ScriptDude.\n// Do not remove these lines, if you want to benefit from automatic updates.\n// source: ${sourceUrl}; hash: ${hash};\n\n${code}` 

  fmcloud.writeString(fmcloud.join(scriptableDir, `${name}.js`), codetostore)
}

function installResources(sourceURL) {
  // Install fixed resources
}

function installConfigs(sourceURL) {
  // Install fixed and malleable configs
}

class Installer {
  
  constructor(name, sourceUrl) {
    this.name = name
    this.url = sourceUrl
    this.fileManager = FileManager.local()
    this.documentsDirectory = this.fileManager.documentsDirectory()
  }
  
  hashCode(input) {
    return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0)
  }
    
  async installScript(name = this.name, sourceUrl = this.url, documentationUrl, icon, color, execute) {
    let filePath = this.fileManager.joinPath(this.documentsDirectory, name + '.js');
    let req = new Request(sourceUrl);
    let code = await req.loadString();
    let hash = this.hashCode(code);
    let codeToStore = Data.fromString(`// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-color: ${color}; icon-glyph: ${icon};\n// This script was downloaded with inspiration from ScriptDude.\n// Do not remove these lines, if you want to benefit from automatic updates.\n// source: ${sourceUrl}; docs: ${documentationUrl}; hash: ${hash};\n\n${code}`);
    this.fileManager.write(filePath, codeToStore);

    if (!execute) return;
    
    let callback = new CallbackURL("scriptable:///add");
    callback.addParameter("scriptName", name);
    callback.open();
  }
  
}

async function installAll() {
    // Install all scripts
    await new Installer('CompassAPI')
}

installAll()