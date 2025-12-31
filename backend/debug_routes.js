const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') && f !== 'router.js' && f !== 'index.js');

console.log('Debugging routes...');

for (const file of files) {
    try {
        require(path.join(routesDir, file));
    } catch (err) {
        console.error(`\n!!! ERROR loading ${file} !!!\n`);
        console.error(err.stack);
        process.exit(1);
    }
}
console.log('All routes loaded successfully.');
