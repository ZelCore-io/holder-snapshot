/**
 * @author JeffVader
 */

 const axios = require('axios');
 const path = require('path');
 const fs = require('fs');
 
 const INFURA_KEY = '2bf416022d924fdcabe3b279f3ac9b90';

 function writeToFileSync(filepath, args) {
   const flag = 'w';
   const fd = fs.openSync(filepath, flag);
   fs.writeSync(fd, args);
   fs.closeSync(fd);
 }
 
 async function getRPCResponse(method, params) {
  const url = `https://mainnet.infura.io/v3/${INFURA_KEY}`;
  params = params || [];
  const data = {
    jsonrpc: "2.0",
    method: method,
    params: params,
    id: 1,
  };
  const headers = {
    "Content-Type": "application/json",
  };
  const response = await axios.post(url, data, headers);
  return response.data.result;
}

async function getContractTransfers(contract, fromBlock, toBlock) {
  const transferHash = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const params = [{"address": contract, "fromBlock": fromBlock, "toBlock": toBlock, "topics": [transferHash]}];
  // Warning: eth_getLogs will fail if there are more than 10,000 records.
  // - at that point we will need to move to a paging approach.
  const logs = await getRPCResponse("eth_getLogs", params);
  logs.forEach((log) => {
    log.amount = Number.parseInt(log.data);
    log.from = log.topics[1].substring(0,2) + log.topics[1].substring(26);
    log.to = log.topics[2].substring(0,2) + log.topics[2].substring(26);
  });
  return logs;
}

function getBalanceList(transfers) {
  const balances = {};
  transfers.forEach((transfer) => {
    let from = balances[transfer.from] || 0;
    let to = balances[transfer.to] || 0;
    from -= transfer.amount;
    to += transfer.amount;
    balances[transfer.from] = from;
    balances[transfer.to] = to;
  });
  const sortedBalances = [];
  for (let address in balances) {
    if (balances[address] > 0) {
      sortedBalances.push({address: address, balance: balances[address]});
    }
  }
  sortedBalances.sort((a, b) => {
    return b.balance - a.balance;
  });
  return sortedBalances;
}

async function start(contract) {
  const blockNum = await getRPCResponse("eth_blockNumber");
  const transfers = await getContractTransfers(contract, '0x0', blockNum);
  const balances = await getBalanceList(transfers);

  let total = 0;
  balances.forEach((balance) => {
    total += Number(balance.balance / (10 ** 8));
  });

  const homeDirPath = path.join(__dirname, './export/');
  const filepath = `${homeDirPath}ethlist.json`;
  console.log(`Done Eth - ${balances.length} records found. Exported at ${filepath}. Total Flux-ETH: ${total.toLocaleString()} (${total}).`);
  writeToFileSync(filepath, JSON.stringify(balances, null, 2));
}
 
 module.exports = { start };
 