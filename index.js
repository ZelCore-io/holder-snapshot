/**
 * @author StultusMundi
 * @author Jeff Vader
 */

const path = require('path');
const fs = require('fs');

const solana = require('./solana');
const tron = require('./tron');
const eth = require('./eth');
const bsc = require('./bsc');

// Create export folder if not exists
const homeDirPath = path.join(__dirname, './export');
if (!fs.existsSync(homeDirPath)) {
  fs.mkdirSync(homeDirPath);
}

// change below for correct contracts
const solanaMint = 'dK83wTVypEpa1pqiBbHY3MNuUnT3ADUZM4wk9VZXZEc'; // Wrapped Aave testing CHANGE
const tronContract = 'TMjQiyqCxfhvxJbrZN9amk9u6n5nEAAgpa'; // KDA testing CHANGE
const ethContract = '0x720cd16b011b987da3518fbf38c3071d4f0d1495';
const bscContract = '0xaff9084f2374585879e8b434c399e29e80cce635';

solana.start(solanaMint);
tron.start(tronContract);
eth.start(ethContract);
bsc.start(bscContract);
