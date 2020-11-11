STEPS TO DEPLOY
1. Install nodejs (if not)
2. Install truffle (if not)
npm install -g truffle
3. Clone the project
git clone https://github.com/servatj/real-fund-smartpool
4. Download dependencies
npm install
5. Before deploy
    - Open folder migrations
    - Open the file 3_whitelist_contracts.js and replace the addresses by the balancer addresses in the environment we are using
5. Deploy in local (Ganache)
truffle migrate --reset
6. or Deploy in testnet (Kovan)
truffle migrate --reset --network kovan
