const crypto = require('crypto');
const secret = "blockchainHandsOn";
const Elliptic = require('elliptic').ec;
const ec = new Elliptic('secp256k1');

class Transaction {
    constructor(senderaddress, receiveraddress, amount) {
        this.senderaddress = senderaddress;
        this.receiveraddress = receiveraddress;
        this.amount = amount;
        this.timestamp = Date.now();
        this.signature = null;
    }

    createHash() {
        return crypto.createHmac('sha256', secret)
        .update(this.senderaddress+this.receiveraddress + this.amount + this.timestamp)
        .digest('hex')
    }

    signTransaction(keypair) {

        if (keypair.getPublic('hex') !== this.senderaddress)
            throw new Error('You cannot sign the transaction')

        const hash = this.createHash();
        const sig = keypair.sign(hash, 'base64');

        this.signature = sig.toDER('hex');

    }

    isValidTransaction() {

        if (this.senderaddress === null) return true;
        if (!this.signature) return false;

        const keypair = ec.keyFromPublic(this.senderaddress, 'hex');
        return keypair.verify(this.createHash(), this.signature);

    }
}

class Block {
    constructor(id, timestamp, transaction, hashOfLastBlock) {
        this.id = id;
        this.timestamp = timestamp;
        this.transaction = transaction;
        this.hashOfLastBlock = hashOfLastBlock;
        this.change = 0;
        this.hash = this.createHash()
    }

    createHash() {
        return crypto.createHmac('sha256', secret)
        .update(this.change+this.id + this.timestamp + JSON.stringify(this.transaction) + this.hashOfLastBlock)
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

    isAllTransactionValid() {
        for (let index = 0; index < this.transaction.length; index++) {
            if (!this.transaction.isValidTransaction()) return false;
            return true;
        }
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createTransaction(transaction) {

        if (!transaction.isValidTransaction())
            throw Error('Your transaction is not valid')

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
            for (let index = 0; index < block.transaction.length; index++) {
                const transaction = block.transaction[index];
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
            if (!this.block.isAllTransactionValid()) return false;
            // condition based on creating temporary hash from data to compare the block.hash value
            if (newHash !== block.hash) return false;

            // condition to check the hash of previous node and hashOfLastBlock value of current block
            if ( this.chain[i - 1].hash !== block.hashOfLastBlock ) return false;
        }
        return true;
    }
}

const keypair = ec.keyFromPrivate('f9890b4ec92d69f95d80b32454922d7f643c70806bac386fb4ce50824eaca0e1');
const walletAddress = keypair.getPublic('hex');

let handsOnCoin = new BlockChain();
const transaction = new Transaction(walletAddress, 'RADRESS', 40);
transaction.signTransaction(keypair);
handsOnCoin.createTransaction(transaction);
// handsOnCoin.createTransaction(new Transaction('batman', 'joker', 100));
// handsOnCoin.createTransaction(new Transaction('joker', 'batman', 50));

handsOnCoin.addBlock(1, walletAddress);
handsOnCoin.addBlock(2, walletAddress);

// handsOnCoin.addBlock(2, 'priyesh');
// handsOnCoin.addBlock(new Block(1, Date.now(), { balance: 100 }));
// handsOnCoin.addBlock(new Block(2, Date.now(), { balance: 200 }));
// handsOnCoin.addBlock(new Block(3, Date.now(), { balance: 300 }));

/** comment out the below to lines to change value of block 2 in the change to check validation
handsOnCoin.chain[2].data.balance = 400
handsOnCoin.chain[2].hash = handsOnCoin.chain[2].createHash() **/

// console.log("handsOnCoin: ", handsOnCoin.chain[1]);
console.log("balance: ", handsOnCoin.getBalance(walletAddress));
// console.log("validate: ", handsOnCoin.isValidBlockchain());