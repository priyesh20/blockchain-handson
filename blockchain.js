const crypto = require('crypto');
const secret = "blockchainHandsOn";

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
    }

    // Every Blockchain starts with a genesis block
    createGenesisBlock() {
        return new Block(0, Date.now(), {}, "")
    }

    // Function to get the last block hash
    getLastBlockHash() {
        return this.chain[this.chain.length - 1].hash;
    }

    // Dunction to add the block
    addBlock(block) {
        block.hashOfLastBlock = this.getLastBlockHash();
        block.mineTheBlock(4);
        this.chain.push(block)
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
handsOnCoin.addBlock(new Block(1, Date.now(), { balance: 100 }));
handsOnCoin.addBlock(new Block(2, Date.now(), { balance: 200 }));
handsOnCoin.addBlock(new Block(3, Date.now(), { balance: 300 }));

/** comment out the below to lines to change value of block 2 in the change to check validation
handsOnCoin.chain[2].data.balance = 400
handsOnCoin.chain[2].hash = handsOnCoin.chain[2].createHash() **/

console.log("handsOnCoin: ", handsOnCoin);
// console.log("validate: ", handsOnCoin.isValidBlockchain());