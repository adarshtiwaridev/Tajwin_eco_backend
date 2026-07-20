import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const modulesDir = path.join(srcDir, 'modules');

if (!fs.existsSync(modulesDir)) {
    fs.mkdirSync(modulesDir, { recursive: true });
}

const mappings = JSON.parse(fs.readFileSync('migration_mappings.json', 'utf8'));

// 1. Move files back to modules
mappings.forEach(mapping => {
    const { mod, type, oldPath, newPath } = mapping;
    // oldPath: "#modules/admin/controller.js"
    // newPath: "#controllers/admin.controller.js"
    
    const ext = path.extname(oldPath); // .js
    
    const modFolder = path.join(modulesDir, mod);
    if (!fs.existsSync(modFolder)) fs.mkdirSync(modFolder, { recursive: true });
    
    // The actual new path on disk is src/controllers/admin.controller.js
    const targetFolder = newPath.split('/')[0].replace('#', '');
    const newFileName = newPath.split('/')[1];
    const sourceFilePath = path.join(srcDir, targetFolder, newFileName);
    
    const destFileName = path.basename(oldPath);
    const destFilePath = path.join(modFolder, destFileName);
    
    if (fs.existsSync(sourceFilePath)) {
        fs.renameSync(sourceFilePath, destFilePath);
    }
});

// Create index.js in each module folder just in case
const currentModules = fs.readdirSync(modulesDir).filter(f => fs.statSync(path.join(modulesDir, f)).isDirectory());
currentModules.forEach(mod => {
    const indexPath = path.join(modulesDir, mod, 'index.js');
    if (!fs.existsSync(indexPath)) fs.writeFileSync(indexPath, '');
});

// 2. Revert package.json imports
const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
delete pkg.imports['#controllers/*'];
delete pkg.imports['#models/*'];
delete pkg.imports['#services/*'];
delete pkg.imports['#repositories/*'];
delete pkg.imports['#validators/*'];
delete pkg.imports['#helpers/*'];
delete pkg.imports['#constants/*'];
delete pkg.imports['#dtos/*'];
delete pkg.imports['#permissions/*'];
// Keep `#routes/*` for now if it was there before, wait it was `#routes/*: "./src/routes/*"`
// Restore aliases
pkg.imports['#modules/*'] = './src/modules/*';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// 3. Search and replace aliases across the whole src directory
function replaceImportsReverse(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            replaceImportsReverse(filePath);
        } else if (filePath.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Replace `#layer/mod.type.js` back to `#modules/mod/type.js`
            // Example: `#helpers/auth.helper.js` -> `#modules/auth/helper.js`
            const aliasRegex = /from\s+['"]#(controllers|models|services|repositories|validators|helpers|constants|dtos|permissions|routes)\/([^.]+)\.([^.]+)\.js['"]/g;
            content = content.replace(aliasRegex, (match, layer, mod, type) => {
                modified = true;
                // Exception for routes: if it was #routes, the original was probably relative in index.js, but `#modules/${mod}/route.js` works perfectly.
                return `from '#modules/${mod}/${type}.js'`;
            });
            
            // Also handle internal relative imports inside modules
            // Since they are back in modules/mod/, `#modules/mod/type.js` will work, but typically they used `./type.js`
            // Let's just replace `#modules/${mod}/` with `./` if the file is inside `modules/${mod}`
            const modMatch = filePath.match(/modules[\\\/]([^\\\/]+)[\\\/]/);
            if (modMatch) {
                const currentMod = modMatch[1];
                const currentAliasRegex = new RegExp(`from\\s+['"]#modules\\/${currentMod}\\/([^'"]+\\.js)['"]`, 'g');
                content = content.replace(currentAliasRegex, (match, p1) => {
                    modified = true;
                    return `from './${p1}'`;
                });
            }

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    });
}

replaceImportsReverse(srcDir);

console.log("Restored modules directory and reversed imports.");
