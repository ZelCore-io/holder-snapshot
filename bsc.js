/**
 * @author JeffVader
 */

 const axios = require('axios');
 const path = require('path');
 const fs = require('fs');
 
const BATCH_SIZE = 5000;
const BSCSCAN_API_KEY = '2ZFM4AB7MG524N2GD1S13Q9MUY16VVJI8F';

const urls = [
  'https://bsc-dataseed.binance.org/',
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc-dataseed1.ninicoin.io/',
]

 function writeToFileSync(filepath, args) {
   const flag = 'w';
   const fd = fs.openSync(filepath, flag);
   fs.writeSync(fd, args);   
   fs.closeSync(fd);
 }
 
 async function getBSCRPCResponse(method, params) {
  const url = urls[Math.floor(Math.random() * urls.length)];
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
  //console.log(response.data);
  if (!response.data.result) {
    console.log(response.data);
  }
  if (response.data.result.length >= 1000) {
    console.log('WARNING: Max results received - lower the BATCH_SIZE');
  }
  return response.data.result;
}

 async function getRPCResponse(params) {
  const url = `https://api.bscscan.com/api`;
  params = params || [];
  const headers = {
    "Content-Type": "application/json",
  };
  const response = await axios.get(url, { params: params }, headers);
  if (!response.data.result) {
    console.log(response.data);
  }
  return response.data.result;
}

async function getContractTransfers(contract, fromBlock, toBlock) {
  let toBlockNum = Number.parseInt(toBlock);
  let fromBlockNum = toBlockNum - BATCH_SIZE + 1;
  const finalFromBlockNum = Number.parseInt(fromBlock);
  const logs = [];
  let running = true;
  while (running) {
    const blockLogs = await getContractTransferBlock(contract, fromBlockNum, toBlockNum);
    logs.push(...blockLogs);
    if (fromBlockNum > BATCH_SIZE && fromBlockNum > finalFromBlockNum+BATCH_SIZE) {
      toBlockNum -= BATCH_SIZE;
      fromBlockNum -= BATCH_SIZE;
    } else {
      running = false;
    }
  }
  const blockLogs = await getContractTransferBlock(contract, finalFromBlockNum, fromBlockNum);
  logs.push(...blockLogs);
  return logs;
}

async function getContractTransferBlock(contract, fromBlock, toBlock) {
  const transferHash = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const params = {
    address: contract,
    fromBlock: fromBlock,
    toBlock: toBlock,
    topic0: transferHash,
    module: 'logs',
    action: 'getLogs',
    apikey: BSCSCAN_API_KEY,
  };
  const validResponse = false;
  while (!validResponse) {
    //console.log(`From: ${fromBlock} - to: ${toBlock}`);
    const logs = await getRPCResponse(params);
    if (logs) {
      logs.forEach((log) => {
        log.amount = Number.parseInt(log.data);
        log.from = log.topics[1].substring(0,2) + log.topics[1].substring(26);
        log.to = log.topics[2].substring(0,2) + log.topics[2].substring(26);
      });
      return logs;
    }
  }
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
  const blockNum = await getBSCRPCResponse("eth_blockNumber");
  const transfers = await getContractTransfers(contract, '0x7F3236', blockNum);
  const balances = await getBalanceList(transfers);

  const homeDirPath = path.join(__dirname, './export/');
  const filepath = `${homeDirPath}bsclist.json`;
  console.log(`Done BSC - ${balances.length} records found. Exported at ${filepath}`);
  writeToFileSync(filepath, JSON.stringify(balances, null, 2));
}
 
module.exports = { start };
 