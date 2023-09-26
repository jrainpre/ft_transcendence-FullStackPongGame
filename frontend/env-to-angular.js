const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.config().parsed;
let environmentFileContent = `
export const environment = {
  production: false,
`;

for (const key in envConfig) {
  const isString = typeof envConfig[key] === 'string';
  environmentFileContent += `  ${key}: ${isString ? '`' + envConfig[key] + '`' : envConfig[key]},
`;
}

environmentFileContent += '};\n';

fs.writeFileSync('./src/environments/environment.ts', environmentFileContent);
fs.writeFileSync('./src/environments/environment.development.ts', environmentFileContent);

