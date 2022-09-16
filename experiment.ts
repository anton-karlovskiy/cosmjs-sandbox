import { readFile } from 'fs/promises'
import {
    DirectSecp256k1HdWallet,
    OfflineDirectSigner
} from '@cosmjs/proto-signing'
import {
    // ray test touch <
    // IndexedTx,
    // ray test touch >
    SigningStargateClient,
    StargateClient
} from '@cosmjs/stargate'
// ray test touch <
// import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
// import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
// ray test touch >

const RPC = 'https://rpc-juno.itastakers.com'
const SENDER_ACCOUNT_ADDRESS = 'juno1umvvpydnheghmp9ly79jcxfk0s4s8c40a7ltah'
const RECIPIENT_ACCOUNT_ADDRESS = 'juno1kv5x8r4qa4lkal0hhyq6lr4vs4awu0sdrk7k95'
const DENOM = 'uatom'

const getAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic((await readFile('./testnet.alice.mnemonic.key')).toString(), {
        prefix: 'juno',
    })
}

const runAll = async (): Promise<void> => {
    const client = await StargateClient.connect(RPC)
    console.log('With client, chain id:', await client.getChainId(), ', height:', await client.getHeight())
    console.log(
        'Sender balances:',
        await client.getAllBalances(SENDER_ACCOUNT_ADDRESS)
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

    const senderSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
    const sender = (await senderSigner.getAccounts())[0].address
    console.log('Sender\'s address from signer', sender)
    const signingClient = await SigningStargateClient.connectWithSigner(RPC, senderSigner)
    console.log(
        'With signing client, chain id:',
        await signingClient.getChainId(),
        ', height:',
        await signingClient.getHeight()
    )

    const recipient = RECIPIENT_ACCOUNT_ADDRESS;

    // ray test touch <
    // console.log('Gas fee:', decodedTx.authInfo!.fee!.amount)
    // console.log('Gas limit:', decodedTx.authInfo!.fee!.gasLimit.toString(10))
    // ray test touch >
    console.log('Sender balance before:', await client.getAllBalances(sender))
    // ray test touch <
    console.log('Recipient balance before:', await client.getAllBalances(recipient))
    const result = await signingClient.sendTokens(sender, recipient, [{ denom: DENOM, amount: '10000' }], {
        amount: [{ denom: DENOM, amount: '500' }],
        gas: '200000',
    })
    console.log('Transfer result:', result)
    // ray test touch >
    console.log('Sender balance after:', await client.getAllBalances(sender))
    // ray test touch <
    console.log('Recipient balance after:', await client.getAllBalances(recipient))
    // ray test touch >
}

runAll()
