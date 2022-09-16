import { readFile } from 'fs/promises'
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from '@cosmjs/proto-signing'
import { IndexedTx, SigningStargateClient, StargateClient } from '@cosmjs/stargate'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

const RPC = 'https://rpc-juno.itastakers.com'
const ANTON_ACCOUNT_ADDRESS = 'juno1umvvpydnheghmp9ly79jcxfk0s4s8c40a7ltah'

const getAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic((await readFile('./testnet.alice.mnemonic.key')).toString(), {
        prefix: 'juno',
    })
}

const runAll = async (): Promise<void> => {
    const client = await StargateClient.connect(RPC)
    console.log('With client, chain id:', await client.getChainId(), ', height:', await client.getHeight())
    console.log(
        'Alice balances:',
        await client.getAllBalances(ANTON_ACCOUNT_ADDRESS)
    )
    // ray test touch <
    // const faucetTx: IndexedTx = (await client.getTx(
    //     '540484BDD342702F196F84C2FD42D63FA77F74B26A8D7383FAA5AB46E4114A9B'
    // ))!
    // console.log('Faucet Tx:', faucetTx)
    // const decodedTx: Tx = Tx.decode(faucetTx.tx)
    // console.log('DecodedTx:', decodedTx)
    // console.log('Decoded messages:', decodedTx.body!.messages)
    // const sendMessage: MsgSend = MsgSend.decode(decodedTx.body!.messages[0].value)
    // console.log('Sent message:', sendMessage)
    // const faucet: string = sendMessage.fromAddress
    // console.log('Faucet balances:', await client.getAllBalances(faucet))
    // // Get the faucet address another way
    // {
    //     const rawLog = JSON.parse(faucetTx.rawLog)
    //     console.log('Raw log:', JSON.stringify(rawLog, null, 4))
    //     const faucet: string = rawLog[0].events
    //         .find((eventEl: any) => eventEl.type === 'coin_spent')
    //         .attributes.find((attribute: any) => attribute.key === 'spender').value
    //     console.log('Faucet address from raw log:', faucet)
    // }
    // ray test touch >

    const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
    const alice = (await aliceSigner.getAccounts())[0].address
    console.log('Alice\'s address from signer', alice)
    const signingClient = await SigningStargateClient.connectWithSigner(RPC, aliceSigner)
    console.log(
        'With signing client, chain id:',
        await signingClient.getChainId(),
        ', height:',
        await signingClient.getHeight()
    )

    // ray test touch <
    // console.log('Gas fee:', decodedTx.authInfo!.fee!.amount)
    // console.log('Gas limit:', decodedTx.authInfo!.fee!.gasLimit.toString(10))
    // ray test touch >
    console.log('Alice balance before:', await client.getAllBalances(alice))
    // ray test touch <
    // console.log('Faucet balance before:', await client.getAllBalances(faucet))
    // const result = await signingClient.sendTokens(alice, faucet, [{ denom: 'uatom', amount: '100000' }], {
    //     amount: [{ denom: 'uatom', amount: '500' }],
    //     gas: '200000',
    // })
    // console.log('Transfer result:', result)
    // ray test touch >
    console.log('Alice balance after:', await client.getAllBalances(alice))
    // ray test touch <
    // console.log('Faucet balance after:', await client.getAllBalances(faucet))
    // ray test touch >
}

runAll()
