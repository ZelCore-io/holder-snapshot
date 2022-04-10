/**
 * @author StultusMundi
 * @author Jeff Vader
 */

const path = require('path');
const fs = require('fs');

const solana = require('./solana');
const tron = require('./tron');

// Create export folder if not exists
const homeDirPath = path.join(__dirname, './export');
if (!fs.existsSync(homeDirPath)) {
  fs.mkdirSync(homeDirPath);
}

// change below for correct contracts
const solanaMint = 'FLUX1wa2GmbtSB6ZGi2pTNbVCw3zEeKnaPCkPtFXxqXe'; // Flux-sol
const tronContract = 'TWr6yzukRwZ53HDe3bzcC8RCTbiKa4Zzb6'; // Flux-tron

solana.start(solanaMint);
tron.start(tronContract);
