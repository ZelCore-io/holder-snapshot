/**
 * @author StultusMundi
 */

const solana = require('./solana');
const tron = require('./tron');

// change below
const solanaMint = 'dK83wTVypEpa1pqiBbHY3MNuUnT3ADUZM4wk9VZXZEc'; // Wrapped Aave testing CHANGE
const tronContract = 'TMjQiyqCxfhvxJbrZN9amk9u6n5nEAAgpa'; // KDA testing CHANGE

solana.start(solanaMint);
tron.start(tronContract);
