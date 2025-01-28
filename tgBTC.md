1. on phone goto telegram wellet (todo: instrctions on how to open wallet)
2. click '...' on the top-right -> `Settings` -> `TON Space` -> scroll down and find `Select network` choose `Testnet`
1. on desktop browser, goto https://web.telegram.org and login telegram
1. goto Wallet (https://web.telegram.org/k/#@wallet)
2. click the wallet button
3. choose `TON Space` at the top
3. scroll down and confirm if it is connected to `Testnet`
3. click `Deposit` below the balance

4. goto https://web.telegram.org/k/#@testgiver_ton_bot
3. type `/start` in the chatbox
3. click `Get 2 TON in testnet`
4. solve the capcha
5. Go back to wallet and check if the TONs arrive

1. Setup a bitcoin wallet like Bitcoin Core that connect to the Bitcoin Signet
2. Obtain a receiving address
1. goto https://web.telegram.org/k/#@testgiver_btc_bot
1. type `/start` in the chatbox
3. click `Get 0.00001 BTC in Signet`
4. solve the capcha
5. Paste the bitcoin address
6. optionally click `Go to mempool` to check the transaction status
6. wait ~1hr (or up to >1 day) for the transaction to be mined and confirmed

1. goto https://sandbox.teleport.tg/app/auth on desktop browser
1. click `Connect Wallet` on top right
1. open the `Telegram Wallet` on phone
2. click the scan icon on top right and scan the QR-code on the desktop browser
3. click `Connect` then `Done`
2. go back to the desktop browser and click `Deposit BTC`
3. Type password (or create password)
4. Copy the BTC address shown
5. open the BTC wallet and choose the send function
6. paste the BTC address in the payee field
7. input the amount to be transfered and bridged (note that the fee is 0.00001-0.000015, that is 15% of what you got in the faucet)
8. confirm the transaction in the BTC wallet and copy the transaction ID
10. go to https://mempool.space/signet/tx/<tx-id>
11. wait for 3 confirmations
12. go back to Teleport and paste the transaction ID
13. open the telegram wallet on phone and there should be a confirmation at the bottom
14. wait for the transaction to be finished on TON network

resources:
https://sandbox.teleport.tg/dashboard/operations