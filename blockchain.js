const crypto = require('crypto');
const secret = "blockchainHandsOn";

class Transaction {
    constructor(senderaddress, receiveraddress, amount) {
        this.senderaddress = senderaddress;
        this.receiveraddress = receiveraddress;
        this.amount = amount;
    }
}

class Block {
    constructor(id, timestamp, data, hashOfLastBlock) {
        this.id = id;
        this.timestamp = timestamp;
        this.data = data;
        this.hashOfLastBlock = hashOfLastBlock;
        this.change = 0;
        this.hash = this.createHash()
    }

    createHash() {
        return crypto.createHmac('sha256', secret)
        .update(this.change+this.id + this.timestamp + JSON.stringify(this.data) + this.hashOfLastBlock)
        .digest('hex')
    }

    mineTheBlock(difficulty) {
        let hash = "";
        while (hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.change++;
            hash = this.createHash();
        }
        console.log("mining done... ", hash);
        this.hash = hash;
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    // Every Blockchain starts with a genesis block
    createGenesisBlock() {
        return new Block(0, Date.now(), {}, "")
    }

    // Function to get the last block hash
    getLastBlockHash() {
        return this.chain[this.chain.length - 1].hash;
    }

    // Function to add the block
    addBlock(index, minersAddress) {
        let block = new Block(index, Date.now(), this.pendingTransactions);
        block.hashOfLastBlock = this.getLastBlockHash();
        block.mineTheBlock(4);
        this.chain.push(block)

        this.pendingTransactions = [new Transaction(null, minersAddress, this.miningReward)];
    }

    getBalance(address) {
        let balance = 0;
        for (let index = 0; index < this.chain.length; index++) {
            const block = this.chain[index];
            for (let index = 0; index < block.data.length; index++) {
                const transaction = block.data[index];
                if (address === transaction.senderaddress) balance -= transaction.amount;
                if (address === transaction.receiveraddress) balance += transaction.amount;
            }
        }
        return balance;
    }

    // Function to validate the blockchain
    isValidBlockchain() {
        for (let i=1; i < this.chain.length; i++) {
            const block = this.chain[i];
            const newHash =  block.createHash();
            // condition based on creating temporary hash from data to compare the block.hash value
            if (newHash !== block.hash) return false;

            // condition to check the hash of previous node and hashOfLastBlock value of current block
            if ( this.chain[i - 1].hash !== block.hashOfLastBlock ) return false;
        }
        return true;
    }
}

let handsOnCoin = new BlockChain();
handsOnCoin.createTransaction(new Transaction('batman', 'joker', 100));
handsOnCoin.createTransaction(new Transaction('joker', 'batman', 50));

handsOnCoin.addBlock(1, 'priyesh');
handsOnCoin.addBlock(2, 'priyesh');
// handsOnCoin.addBlock(new Block(1, Date.now(), { balance: 100 }));
// handsOnCoin.addBlock(new Block(2, Date.now(), { balance: 200 }));
// handsOnCoin.addBlock(new Block(3, Date.now(), { balance: 300 }));

/** comment out the below to lines to change value of block 2 in the change to check validation
handsOnCoin.chain[2].data.balance = 400
handsOnCoin.chain[2].hash = handsOnCoin.chain[2].createHash() **/

console.log("handsOnCoin: ", handsOnCoin.chain[1]);
console.log("balance: ", handsOnCoin.getBalance('priyesh'));
// console.log("validate: ", handsOnCoin.isValidBlockchain());