// ERC20 Tokens
const RealFundTokenERC20 = artifacts.require('./RealFundTokenERC20');
const DaiToken = artifacts.require('./DaiToken');

// Balancer Factory contract
const BFactory = artifacts.require('BFactory');

// Balancer Pools and Factories
const RealFundFactory = artifacts.require('RealFundFactory');
const RealFundSwap = artifacts.require('RealFundSwap');

async function doDeploy(deployer, network, accounts) {
    // 1. Deploy the RealFund ERC20 75.000 tokens
    await deployer.deploy(RealFundTokenERC20, web3.utils.toWei('200000'));
    const REALFUND = await RealFundTokenERC20.deployed();
    console.log('RealFund Token deployed:', REALFUND.address);

    // 2. Deploy the DaiToken (used to simulate 100.000.000 DAIs) 
    await deployer.deploy(DaiToken, web3.utils.toWei('100000000'));
    const DAI = await DaiToken.deployed();
    console.log('DAI Token deployed: ', DAI.address);

    // 3. If we are in a develpment environment, deploy the Balancer Factory Contract, otherwhise, use the address in the ethereum network
    if (network === 'development' || network === 'coverage') {
        await deployer.deploy(BFactory);
        console.log('Balancer Factory deployed');
    }

    // 4. Configure the pool settings
    const swapFee = web3.utils.toWei('0.03');
    const startWeights = [web3.utils.toWei('2'), web3.utils.toWei('38')]; // 50%/50%    // FIXME. Set good parameters
    const startBalances = [web3.utils.toWei('1000'), web3.utils.toWei('1000')];
    const tokenAddresses = [DAI.address, REALFUND.address];

    // 5. Deploy the RealFundFactory contract
    await deployer.deploy(RealFundFactory);
    const realFundFactory = await RealFundFactory.deployed();
    console.log('RealFund Factory deployed:', realFundFactory.address);

    let factory = '';
    if (network === 'development' || network === 'coverage') {
        const balancerFactory = await BFactory.deployed();
        factory = balancerFactory.address;
    } else if (network == 'kovan-fork' || network == 'kovan') {
        factory = web3.utils.toChecksumAddress('0x8f7F78080219d4066A8036ccD30D588B416a40DB');
    }

    // 6. Approving both tokens to let RealFund factory to spend them
    await REALFUND.approve(realFundFactory.address, web3.utils.toTwosComplement(-1));
    await DAI.approve(realFundFactory.address, web3.utils.toTwosComplement(-1));
    console.log('RealFundFactory approved to transfer tokens');

    // 7. Creating Balancer Pool
    const resultPool = await realFundFactory.createPool(
        factory,
        swapFee
    );

    const event = resultPool.logs[0].args;
    const poolAddress = event.pool;
    console.log('Balancer Pool created at address:', poolAddress);

    // 8. Adding RealFundFactory and Pool address to the RealFundToken whitelist
    await REALFUND.addToWhitelist(poolAddress);
    await REALFUND.addToWhitelist(realFundFactory.address);

    if (network == 'kovan-fork' || network == 'kovan') {
        // FIXME. Direcciones de Josep y Jose Ramon
        await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0x65ef5b37369f98701f4EC29258d90489623EC239'));
        await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0xa9aCC2b929B92a86084CCB115b78A6D627309788'));

        // Add Kovan balancer addresses in the whitelist to allow the swap
        await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0x4e67bf5bD28Dd4b570FBAFe11D0633eCbA2754Ec')); // Exchange Proxy
        await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0xC5570FC7C828A8400605e9843106aBD675006093')); // Onchain Registry
        await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0x8DBB8C9bFEb7689f16772c85136993cDA0c05eA4')); // SmartPoolManager (library)
    }

    console.log('RealFundFactory and Pool address added to RealFund token whitelist');

    // 9. Adding tokens to the pool
    await realFundFactory.addTokensToPool(
        poolAddress,
        tokenAddresses,
        startBalances,
        startWeights
    );

    console.log('RealFund and DAI tokens added to the pool');

    // 10. Swapper deployment
    await deployer.deploy(RealFundSwap, poolAddress, REALFUND.address, DAI.address);
    const swap = await RealFundSwap.deployed();
    console.log('Swapper contract deployed at address: ', swap.address);

    // 11. Check there's a price in the pool
    const price = await swap.getSpotPrice();
    console.log('Swapper Price: ', price.toString());

    // 12. Set permissions to the swap contract to do the swap
    await REALFUND.addToWhitelist(swap.address);
    await REALFUND.approve(RealFundSwap.address, web3.utils.toTwosComplement(-1));
    await DAI.approve(RealFundSwap.address, web3.utils.toTwosComplement(-1));
    console.log('Swap contract approve to spend the tokens');
    
    // 13. Transfer the tokens to the swapper contract to do a swap
    // WARNING. DON'T EXECUTE THIS STEP IN PRODUCTION, THE SWAPPER CONTRACT DOESN'T HAVE A FUNCTION TO WITHDRAW THE TOKENS. JUST FOR TEST IN LOCAL
    if (network === 'development' || network === 'coverage') {
        await REALFUND.approve(accounts[0], web3.utils.toTwosComplement(-1));
        await REALFUND.transferFrom(accounts[0], swap.address, web3.utils.toWei('1000'));
        await DAI.approve(accounts[0], web3.utils.toTwosComplement(-1));
        await DAI.transferFrom(accounts[0], swap.address, web3.utils.toWei('1000'));
        console.log('Swap contract approve to spend the tokens');

        let realfundBalance = await REALFUND.balanceOf(swap.address);
        let daiBalance = await DAI.balanceOf(swap.address);
        console.log('SWAP CONTRACT REALFUND BALANCE BEFORE SWAP:', realfundBalance.toString());
        console.log('SWAP CONTRACT DAI BALANCE BEFORE SWAP:', daiBalance.toString());
        await swap.swapRealfundForDai(web3.utils.toWei('2'));
        realfundBalance = await REALFUND.balanceOf(swap.address);
        daiBalance = await DAI.balanceOf(swap.address);
        console.log('SWAP CONTRACT REALFUND BALANCE AFTER SWAP:', realfundBalance.toString());
        console.log('SWAP CONTRACT DAI BALANCE AFTER SWAP:', daiBalance.toString());
    }
}

module.exports = function(deployer, network, accounts) {
    deployer.then(async () => {
        await doDeploy(deployer, network, accounts);
    });
}
