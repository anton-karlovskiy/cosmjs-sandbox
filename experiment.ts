import { readFile } from 'fs/promises'
import {
  DirectSecp256k1HdWallet,
  OfflineDirectSigner
} from '@cosmjs/proto-signing'
import {
  SigningStargateClient,
  StargateClient
} from '@cosmjs/stargate'

const RPC = 'https://rpc-juno.itastakers.com'
const SENDER_ACCOUNT_ADDRESS = 'juno1umvvpydnheghmp9ly79jcxfk0s4s8c40a7ltah'
const RECIPIENT_ACCOUNT_ADDRESS = 'juno1kv5x8r4qa4lkal0hhyq6lr4vs4awu0sdrk7k95'
const DENOM = 'ujuno'

const getAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
  return DirectSecp256k1HdWallet.fromMnemonic((await readFile('./testnet.alice.mnemonic.key')).toString(), {
    prefix: 'juno'
  })
}

const runAll = async (): Promise<void> => {
  const client = await StargateClient.connect(RPC)
  console.log('With client, chain id:', await client.getChainId(), ', height:', await client.getHeight())
  console.log(
    'Sender balances:',
    await client.getAllBalances(SENDER_ACCOUNT_ADDRESS)
  )

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

  console.log('Sender balance before:', await client.getAllBalances(sender))
  console.log('Recipient balance before:', await client.getAllBalances(recipient))
  const result = await signingClient.sendTokens(
    sender,
    recipient,
    [{ denom: DENOM, amount: '10000' }], // 0.01 JUNO as the decimals are 6
    {
      amount: [{ denom: DENOM, amount: '500' }],
      gas: '200000'
    }
  )
  console.log('Transfer result:', result)
  console.log('Sender balance after:', await client.getAllBalances(sender))
  console.log('Recipient balance after:', await client.getAllBalances(recipient))
}

runAll()
