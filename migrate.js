import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const modulesDir = path.join(srcDir, 'modules');

const folders = ['controllers', 'models', 'services', 'repositories', 'validators', 'helpers', 'constants', 'routes'];

// Create new folders
folders.forEach(folder => {
    const dir = path.join(srcDir, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Create dtos and permissions folders as well
if (!fs.existsSync(path.join(srcDir, 'dtos'))) fs.mkdirSync(path.join(srcDir, 'dtos'), { recursive: true });
if (!fs.existsSync(path.join(srcDir, 'permissions'))) fs.mkdirSync(path.join(srcDir, 'permissions'), { recursive: true });

const modules = fs.readdirSync(modulesDir).filter(f => fs.statSync(path.join(modulesDir, f)).isDirectory());

const mappings = [];

// Move files and create mappings
modules.forEach(mod => {
    const modDir = path.join(modulesDir, mod);
    const files = fs.readdirSync(modDir).filter(f => f !== 'index.js' && fs.statSync(path.join(modDir, f)).isFile());
    
    files.forEach(file => {
        const ext = path.extname(file);
        const name = path.basename(file, ext); // e.g. 'controller', 'service', 'constants'
        
        let targetFolder = '';
        if (name === 'controller') targetFolder = 'controllers';
        else if (name === 'model') targetFolder = 'models';
        else if (name === 'service') targetFolder = 'services';
        else if (name === 'repository') targetFolder = 'repositories';
        else if (name === 'validator') targetFolder = 'validators';
        else if (name === 'helper') targetFolder = 'helpers';
        else if (name === 'constants') targetFolder = 'constants';
        else if (name === 'route') targetFolder = 'routes';
        else if (name === 'dto') targetFolder = 'dtos';
        else if (name === 'permissions') targetFolder = 'permissions';
        
        if (targetFolder) {
            const newName = `${mod}.${name}${ext}`;
            const oldPath = path.join(modDir, file);
            const newPath = path.join(srcDir, targetFolder, newName);
            fs.copyFileSync(oldPath, newPath);
            mappings.push({
                mod,
                type: name,
                oldPath: `#modules/${mod}/${file}`, // or relative
                newPath: `#${targetFolder}/${newName}`
            });
        }
    });
});

console.log("Copied files to layered structure.");
fs.writeFileSync('migration_mappings.json', JSON.stringify(mappings, null, 2));

// Update package.json imports
const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.imports['#controllers/*'] = './src/controllers/*';
pkg.imports['#models/*'] = './src/models/*';
pkg.imports['#services/*'] = './src/services/*';
pkg.imports['#repositories/*'] = './src/repositories/*';
pkg.imports['#validators/*'] = './src/validators/*';
pkg.imports['#helpers/*'] = './src/helpers/*';
pkg.imports['#constants/*'] = './src/constants/*';
pkg.imports['#routes/*'] = './src/routes/*';
pkg.imports['#dtos/*'] = './src/dtos/*';
pkg.imports['#permissions/*'] = './src/permissions/*';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log("Updated package.json imports.");

// Now we need a function to replace relative imports inside the newly copied files
function replaceImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Regex for relative imports within the same module, e.g. import { AuthService } from './service.js';
    // We replace './service.js' with '#services/{mod}.service.js'
    const fileName = path.basename(filePath);
    const modMatch = fileName.split('.');
    if (modMatch.length >= 3) {
        const mod = modMatch[0]; // e.g. auth
        
        content = content.replace(/from\s+['"]\.\/([^'"]+)\.js['"]/g, (match, p1) => {
            let targetFolder = '';
            if (p1 === 'controller') targetFolder = 'controllers';
            else if (p1 === 'model') targetFolder = 'models';
            else if (p1 === 'service') targetFolder = 'services';
            else if (p1 === 'repository') targetFolder = 'repositories';
            else if (p1 === 'validator') targetFolder = 'validators';
            else if (p1 === 'helper') targetFolder = 'helpers';
            else if (p1 === 'constants') targetFolder = 'constants';
            else if (p1 === 'route') targetFolder = 'routes';
            else if (p1 === 'dto') targetFolder = 'dtos';
            else if (p1 === 'permissions') targetFolder = 'permissions';
            
            if (targetFolder) {
                return `from '#${targetFolder}/${mod}.${p1}.js'`;
            }
            return match; // fallback
        });
    }
    
    // Regex for alias imports `#modules/{mod}/{file}.js`
    content = content.replace(/from\s+['"]#modules\/([^/]+)\/([^'"]+)\.js['"]/g, (match, p1, p2) => {
        let targetFolder = '';
        if (p2 === 'controller') targetFolder = 'controllers';
        else if (p2 === 'model') targetFolder = 'models';
        else if (p2 === 'service') targetFolder = 'services';
        else if (p2 === 'repository') targetFolder = 'repositories';
        else if (p2 === 'validator') targetFolder = 'validators';
        else if (p2 === 'helper') targetFolder = 'helpers';
        else if (p2 === 'constants') targetFolder = 'constants';
        else if (p2 === 'route') targetFolder = 'routes';
        else if (p2 === 'dto') targetFolder = 'dtos';
        else if (p2 === 'permissions') targetFolder = 'permissions';
        
        if (targetFolder) {
            return `from '#${targetFolder}/${p1}.${p2}.js'`;
        }
        return match;
    });

    fs.writeFileSync(filePath, content, 'utf8');
}

// Process all files in the new folders
const allNewFolders = [...folders, 'dtos', 'permissions'];
allNewFolders.forEach(folder => {
    const dir = path.join(srcDir, folder);
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isFile()) {
            replaceImports(filePath);
        }
    });
});

console.log("Updated relative and alias imports in new files.");
