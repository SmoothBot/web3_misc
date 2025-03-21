
import { ethers, Transaction } from 'ethers'
import 'dotenv/config'

const sendTransaction = async (wallet: ethers.Wallet, nonceAdd: number) => {
    
    // populate transaction and prepare the hash
    const pop = await wallet.populateTransaction({
        to: wallet.address,
        value: ethers.parseEther('0.0001'),
        // nonce: 60342,//await wallet.getNonce() + 1,
        // maxFeePerGas: 2000000014n,
        // maxPriorityFeePerGas: 2000000000n,
    })

    // const fee = pop.maxPriorityFeePerGas!
    // pop.maxPriorityFeePerGas = BigInt(fee.toString()) * 2n


    // console.log(pop)
    // process.exit()

    // console.log('nonce before: ', pop.nonce)
    // pop.nonce = 3836;
    // pop.nonce = pop.nonce! + nonceAdd
    // pop.nonce = 60338 + nonceAdd
    

    // console.log(`nonce: ${pop.nonce}`)
    const sig = await wallet.signTransaction(pop)
    const hash = await ethers.keccak256(sig);

    const start = Date.now()
    // Here we send the transaction, don't wait for a 
    // response andimmeidately request the hash
    // console.time('response')
    // console.time('receipt')

    console.time('getBlock')
    // const blockBefore = await wallet.provider!.getBlockNumber()
    const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER! as string);
    const raw = await provider.send("eth_blockNumber", [])
    const blockBefore = parseInt(raw, 16);
    console.timeEnd('getBlock')
    console.time('tx')
    const tx = wallet.sendTransaction(pop)
    console.log('block before: ', blockBefore)
    

    while (true) {
        const receipt = await wallet.provider!.getTransactionReceipt(hash)
        if (receipt) {
            console.log('block now:    ', await wallet.provider!.getBlockNumber())
            console.log('block receipt:', receipt.blockNumber)
            console.timeEnd('tx')
            console.log(receipt)
            break
        }
        // await new Promise((resolve) => setTimeout(resolve, 100)) // god damn op rpc rate limited me.
    }

    const receipt = await wallet.provider!.getTransactionReceipt(hash)
    // const receipt = await wallet.provider!.getTransaction(hash)!
    // console.log('receipt', receipt)
    console.log('[tx] complete - block diff:', receipt!.blockNumber! - blockBefore)

    // wait
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // console.log(receipt)
    // console.timeEnd('receipt')
    const end = Date.now()
    return {
        t: end - start,
        hash: tx.hash,
    }
}

const createArray = (n: number): number[] => {
    return Array.from({ length: n + 1 }, (_, i) => i);
}

const main = async () => {

    const rpc = process.env.RPC_PROVIDER! as string
    const privateKey1 = process.env.PRIVATE_KEY_1! as string
    const privateKey2 = process.env.PRIVATE_KEY_2! as string
    const provider = new ethers.JsonRpcProvider(rpc)
    const wallet1 = new ethers.Wallet(privateKey1, provider)
    // const wallet2 = new ethers.Wallet(privateKey2, provider)

    // const receipt = await wallet1.provider!.getTransactionReceipt('0xe90206b709ae70c8bcf95c20675d54f98ec31c022e40f074db23a6f4e1469d82')
    // console.log(receipt)
    
    const block = await wallet1.provider!.getBlockNumber()
    console.log('block', block)
    console.log(wallet1.address)
    
    // let i=1
    for (let i = 0; i < 10; i++) {
        const ts = await sendTransaction(wallet1, i)
        console.log(`[TX] e2e time: ${ts.t}ms, hash: ${ts.hash}`)
    }




    // let count = 1000
    // const transacitonPerLoop = 100
    // while(count != 0) {
    //     const start = Date.now()
    //     let nonceAdd = 0
    //     await Promise.all([
    //         // ...createArray(transacitonPerLoop).map((e) => sendTransaction(wallet1, e)),
    //         ...createArray(transacitonPerLoop).map((e) => sendTransaction(wallet2, e))
    //     ])

    //     console.log(`Complete: ${(Date.now() - start)/1000} seconds`)
    //     count--
    // }

}

main()