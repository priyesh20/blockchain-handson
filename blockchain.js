const crypto = require('crypto');
const secret = "blockchainHandsOn";

class Block {
    constructor(id, timestamp, data, hashOfLastBlock) {
        this.id = id;
        this.timestamp = timestamp;
        this.data = data;
        this.hashOfLastBlock = hashOfLastBlock;
        this.hash = this.createHash()
    }

    createHash() {
        return crypto.createHmac('sha256', secret)
        .update(this.id + this.timestamp + JSON.stringify(this.data) + this.hashOfLastBlock)
        .digest('hex')
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

    getLastBlockHash() {
        return this.chain[this.chain.length - 1].hash;
    }

    addBlock(block) {
        block.hashOfLastBlock = this.getLastBlockHash();
        block.hash = block.createHash();
        this.chain.push(block)
    }
}

let handsOnCoin = new BlockChain();
handsOnCoin.addBlock(new Block(1, Date.now(), { balance: 100 }));

console.log("handsOnCoin: ", handsOnCoin);